"use client";

import type { MarkdownSectionHeading } from "@/lib/markdown-headings";
import { markdownHeadingDomId } from "@/lib/markdown-headings";

interface ChapterOutlineProps {
  headings: MarkdownSectionHeading[];
}

export function ChapterOutline({ headings }: ChapterOutlineProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Sections in this chapter"
      className="mb-8 rounded-2xl border border-current/15 bg-current/[0.03] px-4 py-3 sm:px-5 sm:py-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 max-h-[min(40vh,16rem)] overflow-y-auto overscroll-contain pr-1 -mr-1">
        {headings.map((h, i) => (
          <li key={`${h.slug}-${i}`}>
            <a
              href={`#${markdownHeadingDomId(h.slug)}`}
              className="block rounded-lg py-1.5 text-sm leading-snug opacity-90 hover:opacity-100 hover:bg-current/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              style={{ paddingLeft: `${0.5 + (h.depth - 2) * 0.75}rem` }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
