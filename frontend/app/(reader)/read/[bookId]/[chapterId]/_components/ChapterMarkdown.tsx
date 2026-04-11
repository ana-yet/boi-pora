"use client";

import { MarkdownRenderer } from "@/app/components/ui/MarkdownRenderer";
import { extractChapterSectionHeadings } from "@/lib/markdown-headings";
import { ChapterOutline } from "./ChapterOutline";

export function ChapterMarkdown({ content }: { content: string }) {
  const headings = extractChapterSectionHeadings(content);
  const hasOutline = headings.length > 0;

  if (!hasOutline) {
    return (
      <div className="mx-auto w-full max-w-[min(42rem,100%)]">
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col xl:flex-row xl:items-start xl:justify-center xl:gap-10 2xl:gap-12">
      {/* Mobile / tablet: outline sits under the chapter title, above the body */}
      <aside className="order-1 mb-6 w-full max-w-[42rem] shrink-0 self-center xl:order-2 xl:mb-0 xl:w-[13.5rem] xl:max-w-[13.5rem] xl:self-stretch">
        <div
          className="xl:sticky xl:pt-1"
          style={{ top: "calc(4.75rem + env(safe-area-inset-top))" }}
        >
          <ChapterOutline headings={headings} variant="responsive" />
        </div>
      </aside>
      <div className="order-2 min-w-0 w-full max-w-[42rem] shrink-0 self-center xl:order-1">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
