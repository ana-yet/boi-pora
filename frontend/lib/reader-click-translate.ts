/** Characters that belong to a “word” for press-and-hold translate (Latin, Bengali, CJK, etc.). */
export function isWordChar(ch: string): boolean {
  if (!ch) return false;
  const cp = ch.codePointAt(0)!;
  if (ch === "'" || ch === "\u2019" || ch === "-") return true;
  if (cp >= 0x0980 && cp <= 0x09ff) return true;
  if (cp >= 0x0041 && cp <= 0x005a) return true;
  if (cp >= 0x0061 && cp <= 0x007a) return true;
  if (cp >= 0x00c0 && cp <= 0x024f) return true;
  if (cp >= 0x0400 && cp <= 0x04ff) return true;
  if (cp >= 0x3040 && cp <= 0x30ff) return true;
  if (cp >= 0x3400 && cp <= 0x9fff) return true;
  if (cp >= 0x0600 && cp <= 0x06ff) return true;
  if (cp >= 0x0590 && cp <= 0x05ff) return true;
  if (cp >= 0x0e00 && cp <= 0x0e7f) return true;
  if (/\d/.test(ch)) return true;
  return false;
}

function isSentenceTerminator(s: string, i: number): boolean {
  const ch = s[i];
  if (!ch) return false;
  if (ch === "।" || ch === "…") return true;
  if (ch === "." || ch === "!" || ch === "?") {
    const next = s[i + 1];
    return next === undefined || /\s/.test(next) || next === '"' || next === "'" || next === "\u201d" || next === ")";
  }
  return false;
}

export function wordBoundsAt(
  blockText: string,
  caret: number,
): { start: number; end: number } | null {
  const len = blockText.length;
  if (len === 0) return null;
  let i = Math.max(0, Math.min(caret, len - 1));
  if (caret === len && len > 0) i = len - 1;
  if (!isWordChar(blockText[i]!)) {
    if (i + 1 < len && isWordChar(blockText[i + 1]!)) i++;
    else if (i > 0 && isWordChar(blockText[i - 1]!)) i--;
    else return null;
  }
  let start = i;
  let end = i + 1;
  while (start > 0 && isWordChar(blockText[start - 1]!)) start--;
  while (end < len && isWordChar(blockText[end]!)) end++;
  const word = blockText.slice(start, end).trim();
  if (!word) return null;
  return { start, end };
}

export function sentenceContaining(
  blockText: string,
  wordStart: number,
  wordEnd: number,
): string {
  const s = blockText;
  const anchor = Math.min(Math.max(0, wordStart), Math.max(0, s.length - 1));

  let sentStart = 0;
  for (let i = anchor; i >= 0; i--) {
    if (i < s.length && isSentenceTerminator(s, i)) {
      sentStart = i + 1;
      while (sentStart < s.length && /\s/.test(s[sentStart]!)) sentStart++;
      break;
    }
  }

  let sentEnd = s.length;
  const from = Math.max(wordStart, Math.min(wordEnd - 1, s.length - 1), 0);
  for (let i = from; i < s.length; i++) {
    if (isSentenceTerminator(s, i)) {
      sentEnd = i + 1;
      break;
    }
  }

  return s.slice(sentStart, sentEnd).replace(/\s+/g, " ").trim();
}

const BLOCK_TAGS = new Set([
  "P",
  "LI",
  "TD",
  "TH",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "DT",
  "DD",
  "FIGCAPTION",
  "PRE",
]);

export function nearestBlockElement(
  node: Node,
  root: HTMLElement,
): HTMLElement | null {
  let n: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Node);
  while (n && n !== root) {
    if (n instanceof HTMLElement) {
      if (BLOCK_TAGS.has(n.tagName)) return n;
    }
    n = n.parentElement;
  }
  return root.contains(node) ? root : null;
}

export function textOffsetInBlock(
  block: HTMLElement,
  textNode: Text,
  offsetInNode: number,
): number {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let total = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n === textNode) return total + Math.min(offsetInNode, (n as Text).length);
    total += (n as Text).length;
  }
  return -1;
}

export function caretRangeFromClientPoint(
  doc: Document,
  x: number,
  y: number,
): Range | null {
  const d = doc as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof d.caretRangeFromPoint === "function") {
    try {
      return d.caretRangeFromPoint(x, y) ?? null;
    } catch {
      return null;
    }
  }
  const pos = d.caretPositionFromPoint?.(x, y);
  if (pos?.offsetNode?.nodeType === Node.TEXT_NODE) {
    const tn = pos.offsetNode as Text;
    const off = Math.min(Math.max(0, pos.offset), tn.length);
    const r = doc.createRange();
    r.setStart(tn, off);
    r.setEnd(tn, off);
    return r;
  }
  return null;
}
