"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  height = 300,
  placeholder,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState<"edit" | "preview" | "live">("live");

  return (
    <div data-color-mode="light" className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {label}
          </label>
          <div className="flex gap-1 text-xs">
            {(["edit", "live", "preview"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreview(mode)}
                className={`px-2 py-1 rounded transition-colors capitalize ${
                  preview === mode
                    ? "bg-primary text-white"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-600">
        <MDEditor
          value={value}
          onChange={(v) => onChange(v ?? "")}
          height={height}
          preview={preview}
          textareaProps={{ placeholder }}
          visibleDragbar={false}
        />
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Supports Markdown: **bold**, *italic*, # headings, links, images, code blocks, tables, lists
      </p>
    </div>
  );
}
