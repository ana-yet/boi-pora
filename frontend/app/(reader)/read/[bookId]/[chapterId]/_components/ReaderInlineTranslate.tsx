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

function clampPopoverPosition(x: number, y: number) {
    const w = 288;
    const h = 320;
    const pad = 8;
    const left = Math.max(pad, Math.min(x + 12, window.innerWidth - w - pad));
    const top = Math.max(pad, Math.min(y + 12, window.innerHeight - h - pad));
    return { left, top };
}

export function ReaderInlineTranslate({ palette, children }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popover, setPopover] = useState<PopoverState | null>(null);
    const [popoverPos, setPopoverPos] = useState({ left: 12, top: 12 });
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

    useEffect(() => {
        if (!popover) return;
        const onDown = (ev: MouseEvent) => {
            const el = ev.target as Node;
            if (popoverRef.current?.contains(el)) return;
            if (rootRef.current?.contains(el)) return;
            setPopover(null);
        };
        const onKey = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") setPopover(null);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
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
                setError("Choose a different target language, or use “Detect language”.");
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
                setError(e instanceof ApiError ? e.message : "Translation failed");
            } finally {
                setLoading(false);
            }
        },
        [persistLangs, sourceLang, targetLang],
    );

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (!target || !rootRef.current?.contains(target)) return;
        if (target.closest("a[href], button, input, select, textarea, [data-translate-popover]")) return;

        const x = e.clientX;
        const y = e.clientY;
        const range = caretRangeFromClientPoint(document, x, y);
        if (!range || !rootRef.current.contains(range.startContainer)) return;
        if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

        const textNode = range.startContainer as Text;
        const offset = range.startOffset;
        const block = nearestBlockElement(textNode, rootRef.current);
        if (!block) return;

        const blockText = block.textContent ?? "";
        const rel = textOffsetInBlock(block, textNode, offset);
        if (rel < 0) return;

        const wb = wordBoundsAt(blockText, rel);
        if (!wb) return;
        const word = blockText.slice(wb.start, wb.end).trim();
        if (!word) return;
        const sentence = sentenceContaining(blockText, wb.start, wb.end);

        setError(null);
        setResult(null);
        setPopoverPos(clampPopoverPosition(x, y));
        setPopover({ x, y, word, sentence });
    }, []);

    const sentenceSameAsWord = popover ? popover.sentence.trim() === popover.word.trim() : false;

    return (
        <div ref={rootRef} className="relative" onPointerUp={handlePointerUp}>
            {children}
            {popover &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={popoverRef}
                        data-translate-popover
                        role="dialog"
                        aria-label="Translate selection"
                        className="fixed z-[60] w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border shadow-xl p-3 text-left"
                        style={{
                            left: popoverPos.left,
                            top: popoverPos.top,
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                            color: palette.text,
                        }}
                    >
                        <p style={{ color: palette.muted }} className="text-[10px] font-semibold uppercase tracking-wide mb-2">
                            Translate
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <label className="block col-span-1">
                                <span style={{ color: palette.muted }} className="text-[9px] uppercase">
                                    From
                                </span>
                                <select
                                    value={sourceLang}
                                    onChange={(ev) => setSourceLang(ev.target.value)}
                                    style={{ backgroundColor: palette.cardBg, borderColor: palette.border, color: palette.text }}
                                    className="mt-0.5 w-full rounded-lg border px-1.5 py-1 text-xs"
                                >
                                    {READER_TRANSLATE_SOURCE.map((o) => (
                                        <option key={o.code} value={o.code}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block col-span-1">
                                <span style={{ color: palette.muted }} className="text-[9px] uppercase">
                                    To
                                </span>
                                <select
                                    value={targetLang}
                                    onChange={(ev) => setTargetLang(ev.target.value)}
                                    style={{ backgroundColor: palette.cardBg, borderColor: palette.border, color: palette.text }}
                                    className="mt-0.5 w-full rounded-lg border px-1.5 py-1 text-xs"
                                >
                                    {READER_TRANSLATE_TARGET.map((o) => (
                                        <option key={o.code} value={o.code}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => void translateText(popover.word)}
                                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                                className="w-full rounded-xl border px-2 py-2 text-xs font-semibold hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                            >
                                Translate word
                            </button>
                            <button
                                type="button"
                                disabled={loading || sentenceSameAsWord}
                                onClick={() => void translateText(popover.sentence)}
                                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                                className="w-full rounded-xl border px-2 py-2 text-xs font-semibold hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-40"
                                title={sentenceSameAsWord ? "Sentence is the same as this word" : undefined}
                            >
                                Translate sentence
                            </button>
                        </div>
                        {loading && (
                            <p className="mt-2 text-xs" style={{ color: palette.muted }}>
                                Translating…
                            </p>
                        )}
                        {error && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                                {error}
                            </p>
                        )}
                        {result !== null && (
                            <div
                                className="mt-2 rounded-xl border px-2 py-2 text-sm leading-snug"
                                style={{ backgroundColor: palette.cardBg, borderColor: palette.border }}
                            >
                                {result}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setPopover(null)}
                            style={{ color: palette.muted }}
                            className="mt-2 w-full py-1.5 text-[11px] font-medium rounded-lg hover:text-primary transition-colors"
                        >
                            Close
                        </button>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
