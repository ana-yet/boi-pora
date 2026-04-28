"use client";

import {  type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { CopyButton } from "../shared/CopyButton";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const proseOverrides: CSSProperties & Record<string, string> = {
  fontSize: "inherit",
  lineHeight: "inherit",
  fontFamily: "inherit",
  color: "inherit",
  "--tw-prose-body": "currentcolor",
  "--tw-prose-headings": "currentcolor",
  "--tw-prose-lead": "currentcolor",
  "--tw-prose-bold": "currentcolor",
  "--tw-prose-counters": "currentcolor",
  "--tw-prose-bullets": "currentcolor",
  "--tw-prose-hr": "currentcolor",
  "--tw-prose-quotes": "currentcolor",
  "--tw-prose-quote-borders": "currentcolor",
  "--tw-prose-captions": "currentcolor",
  "--tw-prose-kbd": "currentcolor",
  "--tw-prose-code": "currentcolor",
  "--tw-prose-pre-code": "currentcolor",
  "--tw-prose-pre-bg": "rgba(0,0,0,0.05)",
  "--tw-prose-th-borders": "currentcolor",
  "--tw-prose-td-borders": "currentcolor",
  "--tw-prose-links": "var(--color-primary)",
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div
      className={`prose max-w-none
        prose-headings:font-bold prose-headings:leading-tight prose-headings:tracking-tight
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:mb-6 prose-p:leading-relaxed
        prose-a:no-underline hover:prose-a:underline prose-a:font-medium
        prose-blockquote:border-l-primary prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-medium
        prose-pre:rounded-xl prose-pre:shadow-md prose-pre:border prose-pre:border-current/10
        prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
        prose-table:border-collapse prose-th:p-3 prose-td:p-3 prose-th:font-semibold
        prose-li:marker:text-primary prose-ul:my-6 prose-ol:my-6
        prose-hr:my-10 prose-hr:border-current/15
        ${className}`}
      style={proseOverrides}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeSanitize]}
        components={{
          pre({ children, ...props }: any) {
            const codeString = extractCodeFromChildren(children);
            
            return (
              <div className="relative group">
                <pre {...props}>{children}</pre>
                <CopyButton code={codeString} />
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function extractCodeFromChildren(children: any): string {
  try {
    if (typeof children === "string") return children;
    if (children?.props?.children) {
      const code = children.props.children;
      if (Array.isArray(code)) return code.join("");
      return String(code);
    }
    return "";
  } catch {
    return "";
  }
}

