import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Default: Lingva (open proxy around Google Translate) — no API key on public instances.
 * Optional: set TRANSLATE_PROVIDER=libretranslate + LIBRETRANSLATE_API_URL + LIBRETRANSLATE_API_KEY
 * (see https://portal.libretranslate.com — the public libretranslate.com host now requires a key).
 */
const DEFAULT_LINGVA_BASE = 'https://lingva.ml';
const DEFAULT_LIBRETRANSLATE_URL = 'https://libretranslate.com';

interface LingvaResponse {
  translation?: string;
}

interface LibreTranslateResponse {
  translatedText?: string;
  error?: string;
}

function packParagraphs(text: string, max = 900): string[] {
  const paras = text.split(/\n\n+/);
  const packs: string[] = [];
  let cur = '';
  for (const p of paras) {
    const piece = cur ? `${cur}\n\n${p}` : p;
    if (piece.length <= max) {
      cur = piece;
    } else {
      if (cur) packs.push(cur);
      if (p.length <= max) {
        cur = p;
      } else {
        for (let i = 0; i < p.length; i += max) {
          packs.push(p.slice(i, i + max));
        }
        cur = '';
      }
    }
  }
  if (cur) packs.push(cur);
  return packs.filter(Boolean);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

@Injectable()
export class TranslateService {
  constructor(private readonly config: ConfigService) {}

  private provider(): 'lingva' | 'libretranslate' {
    const p = this.config.get<string>('TRANSLATE_PROVIDER')?.trim().toLowerCase();
    return p === 'libretranslate' ? 'libretranslate' : 'lingva';
  }

  private lingvaBase(): string {
    const raw =
      this.config.get<string>('LINGVA_TRANSLATE_BASE_URL')?.trim() ||
      DEFAULT_LINGVA_BASE;
    return raw.replace(/\/$/, '');
  }

  private libreBase(): string {
    const raw =
      this.config.get<string>('LIBRETRANSLATE_API_URL')?.trim() ||
      DEFAULT_LIBRETRANSLATE_URL;
    return raw.replace(/\/$/, '');
  }

  private async translateChunkLingva(
    q: string,
    source: string,
    target: string,
  ): Promise<string> {
    const src = source === 'auto' ? 'auto' : source.toLowerCase();
    const tgt = target.toLowerCase();
    const encoded = encodeURIComponent(q);
    const url = `${this.lingvaBase()}/api/v1/${src}/${tgt}/${encoded}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const text = await res.text();
    let data: LingvaResponse;
    try {
      data = JSON.parse(text) as LingvaResponse;
    } catch {
      throw new ServiceUnavailableException(
        'Translation service returned an unexpected response. Try another LINGVA_TRANSLATE_BASE_URL instance.',
      );
    }
    if (!res.ok) {
      const msg =
        (data as unknown as { error?: string }).error ??
        `Translation failed (${res.status})`;
      if (res.status === 400 || res.status === 404) {
        throw new BadRequestException(msg);
      }
      throw new ServiceUnavailableException(msg);
    }
    const out = data.translation?.trim() ?? '';
    if (!out && q.trim().length > 0) {
      throw new ServiceUnavailableException('Empty translation response');
    }
    return out;
  }

  private async translateChunkLibre(
    q: string,
    source: string,
    target: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('LIBRETRANSLATE_API_KEY')?.trim() ?? '';
    const url = `${this.libreBase()}/translate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q,
        source: source === 'auto' ? 'auto' : source.toLowerCase(),
        target: target.toLowerCase(),
        format: 'text',
        api_key: apiKey,
      }),
    });

    let data: LibreTranslateResponse & { error?: string };
    try {
      data = (await res.json()) as LibreTranslateResponse & { error?: string };
    } catch {
      throw new ServiceUnavailableException('Invalid response from LibreTranslate');
    }

    if (!res.ok) {
      const errMsg = data.error ?? `Translation service error (${res.status})`;
      if (res.status === 400 || res.status === 422) {
        throw new BadRequestException(errMsg);
      }
      throw new ServiceUnavailableException(errMsg);
    }

    const out = data.translatedText?.trim() ?? '';
    if (!out && q.trim().length > 0) {
      throw new ServiceUnavailableException('Empty translation response');
    }
    return out;
  }

  async translateChapter(text: string, source: string, target: string): Promise<{ translated: string }> {
    if (source !== 'auto' && source === target) {
      return { translated: text };
    }

    if (this.provider() === 'libretranslate') {
      const key = this.config.get<string>('LIBRETRANSLATE_API_KEY')?.trim();
      if (!key) {
        throw new BadRequestException(
          'LibreTranslate is selected but LIBRETRANSLATE_API_KEY is not set. Get a key at https://portal.libretranslate.com or use the default Lingva provider (unset TRANSLATE_PROVIDER).',
        );
      }
    }

    const packs = packParagraphs(text, this.provider() === 'lingva' ? 900 : 2000);
    if (packs.length === 0) {
      return { translated: '' };
    }

    const translateOne =
      this.provider() === 'libretranslate'
        ? (chunk: string, src: string, tgt: string) =>
            this.translateChunkLibre(chunk, src, tgt)
        : (chunk: string, src: string, tgt: string) =>
            this.translateChunkLingva(chunk, src, tgt);

    const parts: string[] = [];
    const delayMs = this.provider() === 'lingva' ? 280 : 200;
    for (let i = 0; i < packs.length; i++) {
      const chunk = packs[i]!;
      parts.push(await translateOne(chunk, source, target));
      if (i < packs.length - 1) {
        await sleep(delayMs);
      }
    }
    return { translated: parts.join('\n\n') };
  }
}
