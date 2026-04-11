"use client";

import { MarkdownRenderer } from "@/app/components/ui/MarkdownRenderer";

export function ChapterMarkdown({ content }: { content: string }) {
  return (
    <div className="mx-auto w-full max-w-[min(42rem,100%)]">
      <MarkdownRenderer content={content} />
    </div>
  );
}
