"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { api, ApiError } from "@/lib/api";
import { READER_TRANSLATE_SOURCE, READER_TRANSLATE_TARGET } from "@/lib/reader-translate-langs";
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
  children: ReactNode;
};

/** Hold duration before the translate chip appears (ms). */
const LONG_PRESS_MS = 480;
const MOVE_CANCEL_PX = 12;

function clampPopoverPosition(x: number, y: number) {
  const w = 220;
  const h = 200;
  const pad = 8;
  const left = Math.max(pad, Math.min(x + 8, window.innerWidth - w - pad));
  const top = Math.max(pad, Math.min(y + 8, window.innerHeight - h - pad));
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
export function ReaderInlineTranslate({ palette, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTrackRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [popoverPos, setPopoverPos] = useState({ left: 12, top: 12 });
  const [holding, setHolding] = useState(false);
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("bn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSourceLang(sessionStorage.getItem("boi_pora_reader_translate_src") ?? "auto");
      setTargetLang(sessionStorage.getItem("boi_pora_reader_translate_tgt") ?? "bn");
    } catch {
      /* ignore */
    }
  }, []);

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
    const onDown = (ev: PointerEvent) => {
      const el = ev.target as Node;
      if (popoverRef.current?.contains(el)) return;
      if (rootRef.current?.contains(el)) return;
      setPopover(null);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setPopover(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [popover]);

  useEffect(() => {
    if (!popover) return;
    const update = () => setPopoverPos(clampPopoverPosition(popover.x, popover.y));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [popover]);

  useEffect(() => () => clearLongPress(), [clearLongPress]);

  const persistLangs = useCallback(() => {
    try {
      sessionStorage.setItem("boi_pora_reader_translate_src", sourceLang);
      sessionStorage.setItem("boi_pora_reader_translate_tgt", targetLang);
    } catch {
      /* ignore */
    }
  }, [sourceLang, targetLang]);

  const translateText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (sourceLang !== "auto" && sourceLang === targetLang) {
        setError("Pick another target or use “Detect”.");
        return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const { translated } = await api.post<{ translated: string }>("/api/v1/translate", {
          text: trimmed,
          source: sourceLang,
          target: targetLang,
        });
        setResult(translated.trim());
        persistLangs();
      } catch (e: unknown) {
        setError(e instanceof ApiError ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    },
    [persistLangs, sourceLang, targetLang],
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
          <div
            ref={popoverRef}
            data-translate-popover
            role="dialog"
            aria-label="Translate"
            className="fixed z-60 w-[min(13.5rem,calc(100vw-1rem))] rounded-lg border shadow-lg px-2.5 py-2 text-left"
            style={{
              left: popoverPos.left,
              top: popoverPos.top,
              backgroundColor: palette.bg,
              borderColor: palette.border,
              color: palette.text,
            }}
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <div className="flex min-w-0 flex-1 items-center gap-1 text-[10px] leading-none">
                <select
                  value={sourceLang}
                  onChange={(ev) => setSourceLang(ev.target.value)}
                  style={selectStyle}
                  aria-label="From"
                  className="max-w-[42%] shrink rounded border px-1 py-0.5 text-[10px] outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  {READER_TRANSLATE_SOURCE.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span style={{ color: palette.muted }} className="shrink-0 opacity-60">
                  →
                </span>
                <select
                  value={targetLang}
                  onChange={(ev) => setTargetLang(ev.target.value)}
                  style={selectStyle}
                  aria-label="To"
                  className="max-w-[42%] shrink rounded border px-1 py-0.5 text-[10px] outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                >
                  {READER_TRANSLATE_TARGET.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setPopover(null)}
                aria-label="Close"
                style={{ color: palette.muted }}
                className="-mr-0.5 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-base leading-none opacity-70 transition-opacity hover:opacity-100"
              >
                ×
              </button>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => void translateText(popover.word)}
                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                className="h-7 flex-1 rounded-md border text-[11px] font-medium transition-colors hover:border-primary/45 hover:text-primary disabled:opacity-50"
              >
                Word
              </button>
              <button
                type="button"
                disabled={loading || sentenceSameAsWord}
                onClick={() => void translateText(popover.sentence)}
                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                className="h-7 flex-1 rounded-md border text-[11px] font-medium transition-colors hover:border-primary/45 hover:text-primary disabled:opacity-35"
                title={sentenceSameAsWord ? "Same as word" : "Translate sentence"}
              >
                Sentence
              </button>
            </div>

            {loading && (
              <p className="mt-1.5 text-[10px]" style={{ color: palette.muted }}>
                …
              </p>
            )}
            {error && (
              <p className="mt-1.5 text-[10px] text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            {result !== null && (
              <p
                className="mt-1.5 border-t pt-1.5 text-xs leading-snug"
                style={{ borderColor: palette.border, color: palette.text }}
              >
                {result}
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
