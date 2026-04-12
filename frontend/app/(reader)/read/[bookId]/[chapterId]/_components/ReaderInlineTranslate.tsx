"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { api, ApiError } from "@/lib/api";
import { getLanguageLabel } from "@/lib/constants";
import {
  apiSourceFromBookLanguage,
  READER_TRANSLATE_TARGET,
} from "@/lib/reader-translate-langs";
import {
  caretRangeFromClientPoint,
  nearestBlockElement,
  sentenceContaining,
  textOffsetInBlock,
  wordBoundsAt,
} from "@/lib/reader-click-translate";

export interface InlineTranslatePalette {
  bg: string;
  border: string;
  text: string;
  muted: string;
  cardBg: string;
}

type PopoverState = {
  x: number;
  y: number;
  word: string;
  sentence: string;
};

type Props = {
  palette: InlineTranslatePalette;
  /** Book language from metadata (admin “Language”); drives default translation source. */
  bookLanguage?: string;
  children: ReactNode;
};

/** Hold duration before the translate chip appears (ms). */
const LONG_PRESS_MS = 480;
const MOVE_CANCEL_PX = 12;

function clampPopoverPosition(x: number, y: number) {
  const w = 248;
  const h = 220;
  const pad = 10;
  const left = Math.max(pad, Math.min(x + 6, window.innerWidth - w - pad));
  const top = Math.max(pad, Math.min(y + 4, window.innerHeight - h - pad));
  return { left, top };
}

function resolveWordAtPoint(
  root: HTMLElement,
  doc: Document,
  x: number,
  y: number,
): PopoverState | null {
  const range = caretRangeFromClientPoint(doc, x, y);
  if (!range || !root.contains(range.startContainer)) return null;
  if (range.startContainer.nodeType !== Node.TEXT_NODE) return null;

  const textNode = range.startContainer as Text;
  const offset = range.startOffset;
  const block = nearestBlockElement(textNode, root);
  if (!block) return null;

  const blockText = block.textContent ?? "";
  const rel = textOffsetInBlock(block, textNode, offset);
  if (rel < 0) return null;

  const wb = wordBoundsAt(blockText, rel);
  if (!wb) return null;
  const word = blockText.slice(wb.start, wb.end).trim();
  if (!word) return null;
  const sentence = sentenceContaining(blockText, wb.start, wb.end);
  return { x, y, word, sentence };
}

/**
 * Press and hold on a word in the chapter body to translate via your backend (Langbly).
 * @see https://langbly.com/docs/
 */
export function ReaderInlineTranslate({ palette, bookLanguage, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTrackRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [popoverPos, setPopoverPos] = useState({ left: 12, top: 12 });
  const [holding, setHolding] = useState(false);
  const [targetLang, setTargetLang] = useState("bn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const apiSource = useMemo(() => apiSourceFromBookLanguage(bookLanguage), [bookLanguage]);
  const originalLabel = useMemo(
    () => getLanguageLabel((bookLanguage ?? "en").trim() || "en"),
    [bookLanguage],
  );

  const targetOptions = useMemo(() => {
    if (apiSource === "auto") return READER_TRANSLATE_TARGET;
    return READER_TRANSLATE_TARGET.filter((o) => o.code !== apiSource);
  }, [apiSource]);

  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem("boi_pora_reader_translate_tgt");
    } catch {
      /* ignore */
    }
    const opts = targetOptions;
    const pick =
      (stored && opts.some((o) => o.code === stored) ? stored : null) ??
      opts.find((o) => o.code === "bn")?.code ??
      opts[0]?.code ??
      "en";
    setTargetLang((prev) => (prev === pick ? prev : pick));
  }, [apiSource, targetOptions]);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTrackRef.current = null;
    setHolding(false);
  }, []);

  useEffect(() => {
    if (!popover) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setPopover(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [popover]);

  useEffect(() => {
    if (!popover) return;
    const update = () => setPopoverPos(clampPopoverPosition(popover.x, popover.y));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [popover]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const persistTarget = useCallback(() => {
    try {
      sessionStorage.setItem("boi_pora_reader_translate_tgt", targetLang);
    } catch {
      /* ignore */
    }
  }, [targetLang]);

  const translateText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (apiSource !== "auto" && apiSource === targetLang) {
        setError("Pick another target language.");
        return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const { translated } = await api.post<{ translated: string }>("/api/v1/translate", {
          text: trimmed,
          source: apiSource,
          target: targetLang,
        });
        setResult(translated.trim());
        persistTarget();
      } catch (e: unknown) {
        setError(e instanceof ApiError ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    },
    [apiSource, persistTarget, targetLang],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target || !rootRef.current?.contains(target)) return;
      if (target.closest("a[href], button, input, select, textarea, [data-translate-popover]")) return;

      clearLongPress();
      const sx = e.clientX;
      const sy = e.clientY;
      longPressTrackRef.current = { x: sx, y: sy, pointerId: e.pointerId };
      setHolding(true);

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        const root = rootRef.current;
        if (!root) {
          clearLongPress();
          return;
        }
        const data = resolveWordAtPoint(root, document, sx, sy);
        longPressTrackRef.current = null;
        setHolding(false);
        if (!data) return;
        setError(null);
        setResult(null);
        setPopoverPos(clampPopoverPosition(sx, sy));
        setPopover(data);
      }, LONG_PRESS_MS);
    },
    [clearLongPress],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const track = longPressTrackRef.current;
      if (!track || e.pointerId !== track.pointerId) return;
      const dx = e.clientX - track.x;
      const dy = e.clientY - track.y;
      if (dx * dx + dy * dy > MOVE_CANCEL_PX * MOVE_CANCEL_PX) {
        clearLongPress();
        try {
          rootRef.current?.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    },
    [clearLongPress],
  );

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent) => {
      if (longPressTimerRef.current || longPressTrackRef.current) {
        clearLongPress();
      }
      try {
        rootRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [clearLongPress],
  );

  const sentenceSameAsWord = popover
    ? popover.sentence.trim() === popover.word.trim()
    : false;

  const selectStyle = {
    backgroundColor: palette.cardBg,
    borderColor: palette.border,
    color: palette.text,
  } as const;

  const closePopover = useCallback(() => {
    setPopover(null);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative touch-manipulation ${holding ? "select-none" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
    >
      {children}
      {popover &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Full-screen layer: any press outside the card closes immediately (above reader). */}
            <div
              aria-hidden
              className="fixed inset-0 z-70 touch-none bg-transparent"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                closePopover();
              }}
            />
            <div
              ref={popoverRef}
              data-translate-popover
              role="dialog"
              aria-label="Translate"
              className="fixed z-71 w-[min(15.5rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border text-left shadow-2xl ring-1 ring-black/4 dark:ring-white/6"
              style={{
                left: popoverPos.left,
                top: popoverPos.top,
                backgroundColor: palette.bg,
                borderColor: palette.border,
                color: palette.text,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: palette.border }}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: palette.muted }}>
                  Translate
                </span>
                <button
                  type="button"
                  onClick={closePopover}
                  aria-label="Close"
                  style={{ color: palette.muted }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-black/5 dark:hover:bg-white/8"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2.5 px-3 py-2.5">
                <p className="truncate text-[11px] leading-tight" style={{ color: palette.muted }} title={originalLabel}>
                  <span style={{ color: palette.text }}>{originalLabel}</span>
                  <span className="opacity-75"> · source</span>
                </p>

                <label className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] font-medium" style={{ color: palette.muted }}>
                    Into
                  </span>
                  <select
                    value={targetLang}
                    onChange={(ev) => setTargetLang(ev.target.value)}
                    style={selectStyle}
                    aria-label="Translation language"
                    className="min-w-0 flex-1 cursor-pointer rounded-lg border py-1.5 pr-2 pl-2 text-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {targetOptions.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void translateText(popover.word)}
                    style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                    className="h-8 min-h-8 flex-1 rounded-lg border text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-45"
                  >
                    Word
                  </button>
                  <button
                    type="button"
                    disabled={loading || sentenceSameAsWord}
                    onClick={() => void translateText(popover.sentence)}
                    style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                    className="h-8 min-h-8 flex-1 rounded-lg border text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-35"
                    title={sentenceSameAsWord ? "Same as word" : "Translate sentence"}
                  >
                    Sentence
                  </button>
                </div>

                {loading && (
                  <div className="flex items-center gap-2 py-0.5" style={{ color: palette.muted }} aria-live="polite">
                    <span
                      className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
                      aria-hidden
                    />
                    <span className="text-[11px]">Translating…</span>
                  </div>
                )}
                {error && (
                  <p className="text-[11px] leading-snug text-red-600 dark:text-red-400" role="alert">
                    {error}
                  </p>
                )}
                {result !== null && (
                  <p className="border-t pt-2 text-sm leading-relaxed font-medium" style={{ borderColor: palette.border, color: palette.text }}>
                    {result}
                  </p>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
