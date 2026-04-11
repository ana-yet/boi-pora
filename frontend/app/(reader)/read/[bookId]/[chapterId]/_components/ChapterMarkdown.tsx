"use client";

import { MarkdownRenderer } from "@/app/components/ui/MarkdownRenderer";
import { extractChapterSectionHeadings } from "@/lib/markdown-headings";
import { ChapterOutline } from "./ChapterOutline";

export function ChapterMarkdown({ content }: { content: string }) {
  const headings = extractChapterSectionHeadings(content);

  return (
    <>
      <ChapterOutline headings={headings} />
      <MarkdownRenderer content={content} />
    </>
  );
}
