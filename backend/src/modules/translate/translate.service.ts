import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_LANGBLY_BASE = 'https://api.langbly.com';

interface LangblyTranslateResponse {
  data?: {
    translations?: Array<{
      translatedText?: string;
      detectedSourceLanguage?: string;
    }>;
  };
  error?: { message?: string; code?: number };
}

function packParagraphs(text: string, max = 4500): string[] {
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

  private baseUrl(): string {
    const raw =
      this.config.get<string>('LANGBLY_API_BASE_URL')?.trim() ||
      DEFAULT_LANGBLY_BASE;
    return raw.replace(/\/$/, '');
  }

  private apiKey(): string | undefined {
    const k = this.config.get<string>('LANGBLY_API_KEY')?.trim();
    return k || undefined;
  }

  private async translateChunk(
    q: string,
    source: string,
    target: string,
  ): Promise<string> {
    const key = this.apiKey();
    if (!key) {
      throw new ServiceUnavailableException(
        'Translation is not configured. Set LANGBLY_API_KEY (see https://langbly.com/docs/).',
      );
    }

    const url = `${this.baseUrl()}/language/translate/v2`;
    const body: Record<string, string> = {
      q,
      target: target.toLowerCase(),
      format: 'text',
    };
    if (source && source !== 'auto') {
      body.source = source.toLowerCase();
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(body),
    });

    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      throw new ServiceUnavailableException(
        'Invalid response from translation service',
      );
    }

    const data = parsed as LangblyTranslateResponse;
    if (!res.ok) {
      const msg =
        data.error?.message ??
        (typeof parsed === 'object' &&
        parsed !== null &&
        'message' in parsed &&
        typeof (parsed as { message: unknown }).message === 'string'
          ? (parsed as { message: string }).message
          : `Translation failed (${res.status})`);
      if (res.status === 400 || res.status === 422) {
        throw new BadRequestException(msg);
      }
      if (res.status === 401) {
        throw new ServiceUnavailableException(
          'Invalid or missing Langbly API key (check LANGBLY_API_KEY).',
        );
      }
      throw new ServiceUnavailableException(msg);
    }

    const out =
      data.data?.translations?.[0]?.translatedText?.trim() ?? '';
    if (!out && q.trim().length > 0) {
      throw new ServiceUnavailableException('Empty translation response');
    }
    return out;
  }

  async translateChapter(
    text: string,
    source: string,
    target: string,
  ): Promise<{ translated: string }> {
    if (source !== 'auto' && source === target) {
      return { translated: text };
    }
    const packs = packParagraphs(text, 4500);
    if (packs.length === 0) {
      return { translated: '' };
    }
    const parts: string[] = [];
    for (let i = 0; i < packs.length; i++) {
      parts.push(await this.translateChunk(packs[i]!, source, target));
      if (i < packs.length - 1) {
        await sleep(120);
      }
    }
    return { translated: parts.join('\n\n') };
  }
}
