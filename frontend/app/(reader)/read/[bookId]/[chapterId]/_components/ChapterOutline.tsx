"use client";

import type { MarkdownSectionHeading } from "@/lib/markdown-headings";
import { markdownHeadingDomId } from "@/lib/markdown-headings";

interface ChapterOutlineProps {
  headings: MarkdownSectionHeading[];
  /**
   * `responsive` — card under the chapter on small screens; slim sticky rail on `xl+`.
   * `stacked` / `sidebar` — fixed layout for one breakpoint.
   */
  variant?: "responsive" | "sidebar" | "stacked";
}

export function ChapterOutline({ headings, variant = "responsive" }: ChapterOutlineProps) {
  if (headings.length === 0) return null;

  const isResponsive = variant === "responsive";
  const isSidebar = variant === "sidebar";

  const navClass =
    isResponsive
      ? "rounded-2xl border border-current/15 bg-current/[0.03] px-4 py-3 sm:px-5 sm:py-4 xl:rounded-l-lg xl:rounded-r-md xl:border xl:border-current/12 xl:bg-current/[0.04] xl:px-3 xl:py-3 xl:border-l-2 xl:border-l-primary/35 xl:shadow-sm"
      : isSidebar
        ? "rounded-xl border border-current/12 bg-current/[0.025] px-3 py-3 sm:px-4 sm:py-4 border-l-2 border-l-primary/25 border-y border-r"
        : "rounded-2xl border border-current/15 bg-current/[0.03] px-4 py-3 sm:px-5 sm:py-4";

  const listClass =
    isResponsive
      ? "max-h-[min(40vh,16rem)] xl:max-h-[calc(100vh-6.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 -mr-0.5"
      : isSidebar
        ? "max-h-[min(50vh,18rem)] xl:max-h-[calc(100vh-6.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 -mr-0.5"
        : "max-h-[min(40vh,16rem)] space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 -mr-0.5";

  const linkClass =
    isResponsive
      ? "block rounded-lg py-1.5 text-sm leading-snug opacity-90 hover:opacity-100 hover:bg-current/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 xl:py-1 xl:text-[13px] xl:leading-snug"
      : "block rounded-lg py-1.5 text-sm leading-snug opacity-90 hover:opacity-100 hover:bg-current/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <nav aria-label="Sections in this chapter" className={navClass}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-3">
        On this page
      </p>
      <ul className={listClass}>
        {headings.map((h, i) => (
          <li key={`${h.slug}-${i}`}>
            <a
              href={`#${markdownHeadingDomId(h.slug)}`}
              className={linkClass}
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
