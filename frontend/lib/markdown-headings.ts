import GithubSlugger from "github-slugger";

/**
 * Prefix applied by `hast-util-sanitize` / `rehype-sanitize` to `id` (GitHub-style clobber avoidance).
 * Must match rendered heading `id`s after sanitization so in-page links work.
 */
export const MARKDOWN_HEADING_ID_PREFIX = "user-content-";

export function markdownHeadingDomId(slug: string): string {
  return `${MARKDOWN_HEADING_ID_PREFIX}${slug}`;
}

export interface MarkdownSectionHeading {
  depth: number;
  /** Plain text for display */
  text: string;
  /** Base slug (without `user-content-` prefix) — matches `rehype-slug`. */
  slug: string;
}

/** Strip common inline markdown so slugging matches `rehype-slug` / GitHub more closely. */
export function stripInlineMarkdownForSlug(raw: string): string {
  let s = raw.trim();
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/_([^_]+)_/g, "$1");
  s = s.replace(/<[^>]+>/g, "");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Parse ATX headings `##` … `######` for an in-chapter outline (skips `#` to avoid duplicating a lone title).
 */
export function extractChapterSectionHeadings(markdown: string): MarkdownSectionHeading[] {
  const slugger = new GithubSlugger();
  const out: MarkdownSectionHeading[] = [];
  const re = /^(#{2,6})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const depth = m[1].length;
    const text = stripInlineMarkdownForSlug(m[2]);
    if (!text) continue;
    const slug = slugger.slug(text);
    if (!slug) continue;
    out.push({ depth, text, slug });
  }
  return out;
}
