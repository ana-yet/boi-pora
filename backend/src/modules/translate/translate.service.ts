import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const MYMEMORY_GET = 'https://api.mymemory.translated.net/get';

interface MyMemoryResponse {
  responseStatus?: number;
  responseData?: { translatedText?: string; match?: number };
  quotaFinished?: boolean;
  error?: string;
}

function packParagraphs(text: string, max = 420): string[] {
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

  private langPair(source: string, target: string): string {
    const s = source === 'auto' ? 'auto' : source.toLowerCase();
    const t = target.toLowerCase();
    return `${s}|${t}`;
  }

  private async translateOne(
    q: string,
    langpair: string,
    contactEmail?: string,
  ): Promise<string> {
    const url = new URL(MYMEMORY_GET);
    url.searchParams.set('q', q);
    url.searchParams.set('langpair', langpair);
    if (contactEmail) {
      url.searchParams.set('de', contactEmail);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new ServiceUnavailableException('Translation service returned an error');
    }
    const data = (await res.json()) as MyMemoryResponse;
    if (data.quotaFinished) {
      throw new ServiceUnavailableException('Translation quota exceeded; try again later');
    }
    if (data.responseStatus && data.responseStatus !== 200) {
      throw new BadRequestException(data.error ?? 'Translation rejected');
    }
    const out = data.responseData?.translatedText?.trim();
    if (!out) {
      throw new ServiceUnavailableException('Empty translation response');
    }
    return out;
  }

  async translateChapter(text: string, source: string, target: string): Promise<{ translated: string }> {
    if (source !== 'auto' && source === target) {
      return { translated: text };
    }
    const langpair = this.langPair(source, target);
    const contactEmail = this.config.get<string>('MYMEMORY_CONTACT_EMAIL')?.trim() || undefined;
    const packs = packParagraphs(text, 420);
    if (packs.length === 0) {
      return { translated: '' };
    }
    const parts: string[] = [];
    for (let i = 0; i < packs.length; i++) {
      const chunk = packs[i]!;
      const translated = await this.translateOne(chunk, langpair, contactEmail);
      parts.push(translated);
      if (i < packs.length - 1) {
        await sleep(130);
      }
    }
    return { translated: parts.join('\n\n') };
  }
}
