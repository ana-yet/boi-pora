/** Must stay in sync with backend `TranslateTextDto` allowed codes. */
export const READER_TRANSLATE_SOURCE = [
  { code: "auto", label: "Detect language" },
  { code: "en", label: "English" },
  { code: "bn", label: "Bengali" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "it", label: "Italian" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "id", label: "Indonesian" },
  { code: "th", label: "Thai" },
  { code: "pl", label: "Polish" },
  { code: "nl", label: "Dutch" },
  { code: "sv", label: "Swedish" },
  { code: "el", label: "Greek" },
  { code: "he", label: "Hebrew" },
  { code: "fa", label: "Persian" },
  { code: "ur", label: "Urdu" },
] as const;

export const READER_TRANSLATE_TARGET = READER_TRANSLATE_SOURCE.filter(
  (o) => o.code !== "auto",
);

const API_SOURCE_CODES = new Set<string>(
  READER_TRANSLATE_SOURCE.filter((o) => o.code !== "auto").map((o) => o.code),
);

/**
 * Map the book’s catalog language to a `source` code for `/api/v1/translate`.
 * Uses the book code when the translator supports it; otherwise `auto`.
 */
export function apiSourceFromBookLanguage(bookLanguage: string | undefined): string {
  const raw = (bookLanguage ?? "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split(/[-_]/)[0] ?? raw;
  if (API_SOURCE_CODES.has(base)) return base;
  if (API_SOURCE_CODES.has(raw)) return raw;
  return "auto";
}
