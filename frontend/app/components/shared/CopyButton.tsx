import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white rounded-lg opacity-100 group-hover:opacity-100 hover:bg-gray-600 transition-all"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <span className="material-icons text-sm leading-none" aria-hidden="true">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}