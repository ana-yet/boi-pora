import { PipeTransform, Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'span',
    'div',
    'sup',
    'sub',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    pre: ['class'],
    span: ['class'],
    div: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

export function sanitizeText(value: string): string {
  return sanitizeHtml(value, SANITIZE_OPTIONS);
}

type SanitizedArrayItem =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value === 'string') {
      return sanitizeText(value);
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value as Record<string, unknown>);
    }
    return value;
  }

  private sanitizeObject(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        result[key] = sanitizeText(val);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) => this.sanitizeArrayItem(item));
      } else if (typeof val === 'object' && val !== null) {
        result[key] = this.sanitizeObject(val as Record<string, unknown>);
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  private sanitizeArrayItem(item: unknown): SanitizedArrayItem {
    if (typeof item === 'string') return sanitizeText(item);
    if (typeof item === 'object' && item !== null) {
      return this.sanitizeObject(item as Record<string, unknown>);
    }
    if (
      typeof item === 'number' ||
      typeof item === 'boolean' ||
      item === null
    ) {
      return item;
    }
    return null;
  }
}
