"use client";

import type { ReaderTheme } from "./ReaderShell";
import type { MarkdownSectionHeading } from "@/lib/markdown-headings";
import { markdownHeadingDomId } from "@/lib/markdown-headings";

interface PanelColors {
  bg: string;
  border: string;
  text: string;
  muted: string;
  hoverBg: string;
}

const PANEL_COLORS: Record<ReaderTheme, PanelColors> = {
  light: { bg: "#fdfbf9", border: "#e5ddd5", text: "#4a4036", muted: "#8c8075", hoverBg: "#f3eee9" },
  dark: { bg: "#1c1c1c", border: "#3a3a3a", text: "#cccccc", muted: "#666666", hoverBg: "#262626" },
  sepia: { bg: "#faf0d7", border: "#d4be94", text: "#4a3824", muted: "#8a7560", hoverBg: "#f0e2c4" },
};

interface SectionOutlineSidebarProps {
  headings: MarkdownSectionHeading[];
  open: boolean;
  onClose: () => void;
  readerTheme: ReaderTheme;
}

export function SectionOutlineSidebar({
  headings,
  open,
  onClose,
  readerTheme,
}: SectionOutlineSidebarProps) {
  if (!open || headings.length === 0) return null;

  const pc = PANEL_COLORS[readerTheme];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm motion-safe:transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside
        style={{ backgroundColor: pc.bg, color: pc.text, borderColor: pc.border }}
        className="fixed top-0 right-0 h-full w-[min(20rem,88vw)] z-50 shadow-2xl flex flex-col overflow-hidden border-l animate-[slideInRight_0.2s_ease-out] pt-[env(safe-area-inset-top)]"
      >
        <div style={{ borderColor: pc.border }} className="flex items-center justify-between px-4 py-4 border-b shrink-0">
          <h3 className="font-semibold flex items-center gap-2 text-sm tracking-tight">
            <span className="material-icons text-primary text-xl" aria-hidden="true">
              subject
            </span>
            This chapter
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ color: pc.muted }}
            className="p-2 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Close section list"
          >
            <span className="material-icons text-xl" aria-hidden="true">close</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2 space-y-0.5" aria-label="Sections in this chapter">
          {headings.map((h, i) => (
            <a
              key={`${h.slug}-${i}`}
              href={`#${markdownHeadingDomId(h.slug)}`}
              onClick={onClose}
              style={{ color: pc.text }}
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-transparent transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span style={{ color: pc.muted }} className="text-[11px] font-mono tabular-nums mt-0.5 shrink-0 w-5 opacity-90">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-sm leading-snug font-medium min-w-0 flex-1"
                style={{ paddingLeft: `${(h.depth - 2) * 0.5}rem` }}
              >
                {h.text}
              </span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
