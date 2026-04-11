"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SettingsPanel } from "./SettingsPanel";
import { TOCSidebar } from "./TOCSidebar";
import { SectionOutlineSidebar } from "./SectionOutlineSidebar";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { extractChapterSectionHeadings, type MarkdownSectionHeading } from "@/lib/markdown-headings";
import { splitContent } from "@/lib/chapter-read-utils";
import { api, ApiError } from "@/lib/api";
import { ChapterMarkdown } from "./ChapterMarkdown";
import { ChapterContent } from "./ChapterContent";

export type ReaderTheme = "light" | "dark" | "sepia";
export type ReaderFont = "serif" | "sans" | "mono";
export type ReaderSpacing = "compact" | "normal" | "loose";

export interface ReaderSettings {
    theme: ReaderTheme;
    font: ReaderFont;
    fontSize: number;
    spacing: ReaderSpacing;
}

export const READER_SETTINGS_DEFAULTS: ReaderSettings = {
    theme: "light",
    font: "serif",
    fontSize: 18,
    spacing: "normal",
};

const DEFAULTS = READER_SETTINGS_DEFAULTS;

const STORAGE_KEY = "boi_pora_reader_settings";

function getFullscreenElement(): Element | null {
    return (
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
        null
    );
}

async function enterFullscreenEl(el: HTMLElement): Promise<void> {
    try {
        if (typeof el.requestFullscreen === "function") {
            await el.requestFullscreen();
            return;
        }
    } catch {
        /* unsupported or denied */
    }
    const wk = (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
    if (typeof wk === "function") wk.call(el);
}

async function exitFullscreenDoc(): Promise<void> {
    try {
        if (typeof document.exitFullscreen === "function") {
            await document.exitFullscreen();
            return;
        }
    } catch {
        /* noop */
    }
    const wk = (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen;
    if (typeof wk === "function") wk.call(document);
}

function loadSettings(): ReaderSettings {
    if (typeof window === "undefined") return DEFAULTS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULTS;
        const parsed = JSON.parse(raw);
        return {
            theme: ["light", "dark", "sepia"].includes(parsed.theme) ? parsed.theme : DEFAULTS.theme,
            font: ["serif", "sans", "mono"].includes(parsed.font) ? parsed.font : DEFAULTS.font,
            fontSize: typeof parsed.fontSize === "number" && parsed.fontSize >= 14 && parsed.fontSize <= 30 ? parsed.fontSize : DEFAULTS.fontSize,
            spacing: ["compact", "normal", "loose"].includes(parsed.spacing) ? parsed.spacing : DEFAULTS.spacing,
        };
    } catch {
        return DEFAULTS;
    }
}

function saveSettings(s: ReaderSettings) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const FONT_MAP: Record<ReaderFont, string> = {
    serif: "'Merriweather', serif",
    sans: "'Work Sans', sans-serif",
    mono: "'Courier New', monospace",
};

const SPACING_MAP: Record<ReaderSpacing, string> = {
    compact: "1.4",
    normal: "1.6",
    loose: "1.8",
};

interface ThemeColors {
    bg: string;
    text: string;
    muted: string;
    headerBg: string;
    border: string;
}

const COLORS: Record<ReaderTheme, ThemeColors> = {
    light: {
        bg: "#fdfcfb",
        text: "#2c2c2c",
        muted: "#8c8075",
        headerBg: "rgba(253,252,251,0.97)",
        border: "#e5ddd5",
    },
    dark: {
        bg: "#121212",
        text: "#e0e0e0",
        muted: "#737373",
        headerBg: "rgba(18,18,18,0.97)",
        border: "#2a2a2a",
    },
    sepia: {
        bg: "#f4ecd8",
        text: "#433422",
        muted: "#8a7560",
        headerBg: "rgba(244,236,216,0.97)",
        border: "#d4be94",
    },
};

export interface ReaderChapterArticle {
    /** Line above title, e.g. “Chapter One”. */
    ordinalLine: string;
    chapterTitle: string;
    content: string;
    isMarkdown: boolean;
    /** Passed to plain-text body (`ChapterContent`). */
    plainChapterNumberLabel: string;
}

interface ReaderShellProps {
    bookTitle: string;
    chapterLabel: string;
    progress: { currentPage: number; totalPages: number; percentage: number };
    /** When set, shows “Chapter n of m” in the footer for context. */
    chapterPosition?: { current: number; total: number };
    prevHref?: string;
    nextHref?: string;
    bookId: string;
    currentChapterId: string;
    chapters: { chapterId: string; chapterNumber: number; title: string; wordCount?: number }[];
    /** Shell renders header + body and enables MyMemory translation. */
    chapterArticle: ReaderChapterArticle;
}

export function ReaderShell({
    bookTitle,
    chapterLabel,
    progress,
    chapterPosition,
    prevHref,
    nextHref,
    bookId,
    currentChapterId,
    chapters,
    chapterArticle,
}: ReaderShellProps) {
    const router = useRouter();
    const shellRef = useRef<HTMLDivElement>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);
    const [mounted, setMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [showTranslated, setShowTranslated] = useState(false);
    const [translateLoading, setTranslateLoading] = useState(false);
    const [translateError, setTranslateError] = useState<string | null>(null);
    const [sourceLang, setSourceLang] = useState("auto");
    const [targetLang, setTargetLang] = useState("bn");

    useEffect(() => {
        setSettings(loadSettings());
        try {
            setSourceLang(sessionStorage.getItem("boi_pora_reader_translate_src") ?? "auto");
            setTargetLang(sessionStorage.getItem("boi_pora_reader_translate_tgt") ?? "bn");
        } catch {
            /* ignore */
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        setSectionsOpen(false);
        setTocOpen(false);
        setTranslatedText(null);
        setShowTranslated(false);
        setTranslateError(null);
    }, [currentChapterId]);

    useEffect(() => {
        const sync = () => {
            const el = shellRef.current;
            setIsFullscreen(Boolean(el && getFullscreenElement() === el));
        };
        sync();
        document.addEventListener("fullscreenchange", sync);
        document.addEventListener("webkitfullscreenchange", sync as EventListener);
        return () => {
            document.removeEventListener("fullscreenchange", sync);
            document.removeEventListener("webkitfullscreenchange", sync as EventListener);
        };
    }, []);

    const toggleFullscreen = useCallback(async () => {
        const el = shellRef.current;
        if (!el) return;
        try {
            if (getFullscreenElement() === el) {
                await exitFullscreenDoc();
            } else {
                await enterFullscreenEl(el);
            }
        } catch {
            /* user denied or API unsupported */
        }
    }, []);

    const handleSettingsChange = useCallback((newSettings: ReaderSettings) => {
        setSettings(newSettings);
        saveSettings(newSettings);
    }, []);

    const displayBody =
        showTranslated && translatedText !== null ? translatedText : chapterArticle.content;

    const resolvedSectionHeadings = useMemo((): MarkdownSectionHeading[] | undefined => {
        if (!chapterArticle.isMarkdown) return undefined;
        const h = extractChapterSectionHeadings(displayBody);
        return h.length ? h : undefined;
    }, [chapterArticle.isMarkdown, displayBody]);

    const hasSectionNav = (resolvedSectionHeadings?.length ?? 0) > 0;

    const runTranslate = useCallback(async () => {
        setTranslateLoading(true);
        setTranslateError(null);
        try {
            const { translated } = await api.post<{ translated: string }>("/api/v1/translate", {
                text: chapterArticle.content,
                source: sourceLang,
                target: targetLang,
            });
            setTranslatedText(translated);
            setShowTranslated(true);
            try {
                sessionStorage.setItem("boi_pora_reader_translate_src", sourceLang);
                sessionStorage.setItem("boi_pora_reader_translate_tgt", targetLang);
            } catch {
                /* ignore */
            }
        } catch (e: unknown) {
            const msg = e instanceof ApiError ? e.message : "Translation failed";
            setTranslateError(msg);
        } finally {
            setTranslateLoading(false);
        }
    }, [chapterArticle.content, sourceLang, targetLang]);

    const shortcuts = useMemo(
        () => ({
            arrowleft: () => {
                if (prevHref) router.push(prevHref);
            },
            arrowright: () => {
                if (nextHref) router.push(nextHref);
            },
            t: () => {
                setTocOpen((o) => {
                    const next = !o;
                    if (next) setSectionsOpen(false);
                    return next;
                });
            },
            ...(hasSectionNav
                ? {
                      s: () => {
                          setSectionsOpen((o) => {
                              const next = !o;
                              if (next) setTocOpen(false);
                              return next;
                          });
                      },
                  }
                : {}),
            escape: () => {
                setTocOpen(false);
                setSectionsOpen(false);
                setPanelOpen(false);
            },
            f: () => {
                void toggleFullscreen();
            },
        }),
        [hasSectionNav, nextHref, prevHref, router, toggleFullscreen],
    );

    useKeyboardShortcuts(shortcuts);

    const c = COLORS[settings.theme];

    const wrapperStyle: CSSProperties = {
        backgroundColor: c.bg,
        color: c.text,
        minHeight: "100vh",
        transition: "background-color 0.3s, color 0.3s",
    };

    const headerStyle: CSSProperties = {
        backgroundColor: c.headerBg,
        borderColor: c.border,
        color: c.text,
    };

    const quoteBg =
        settings.theme === "dark"
            ? "rgba(255,255,255,0.045)"
            : settings.theme === "sepia"
              ? "rgba(67,52,34,0.07)"
              : "rgba(0,0,0,0.035)";
    const hrColor =
        settings.theme === "dark" ? "rgba(255,255,255,0.12)" : settings.theme === "sepia" ? "rgba(212,190,148,0.55)" : "rgba(0,0,0,0.08)";

    const settingsCSS = `
        .boi-reader-article {
            font-size: ${settings.fontSize}px;
            font-family: ${FONT_MAP[settings.font]};
            color: ${c.text};
            text-align: justify;
            text-rendering: optimizeLegibility;
            hyphens: auto;
            -webkit-hyphens: auto;
            -moz-hyphens: auto;
            -ms-hyphens: auto;
        }
        .boi-reader-article p,
        .boi-reader-article li,
        .boi-reader-article td,
        .boi-reader-article th,
        .boi-reader-article blockquote,
        .boi-reader-article figcaption {
            line-height: ${SPACING_MAP[settings.spacing]} !important;
        }
        .boi-reader-article p {
            margin-bottom: 1.5em;
        }
        .boi-reader-article a {
            text-underline-offset: 3px;
            text-decoration-thickness: 1px;
        }
        .boi-reader-article hr {
            border: 0;
            height: 1px;
            margin: 2.5rem 0;
            background: linear-gradient(90deg, transparent, ${hrColor}, transparent);
        }
        .boi-reader-article blockquote {
            margin: 1.75rem 0;
            padding: 0.85rem 1.1rem 0.85rem 1rem;
            border-left: 3px solid var(--color-primary);
            border-radius: 0 0.6rem 0.6rem 0;
            background: ${quoteBg};
            font-style: italic;
        }
        .boi-reader-article :is(h1, h2) {
            margin-top: 2.35em;
            margin-bottom: 0.65em;
            font-weight: 700;
            letter-spacing: -0.02em;
            text-align: start;
        }
        .boi-reader-article h1:first-child,
        .boi-reader-article h2:first-child {
            margin-top: 0.35em;
        }
        .boi-reader-article h3, .boi-reader-article h4 {
            margin-top: 1.85em;
            margin-bottom: 0.5em;
            font-weight: 600;
            letter-spacing: -0.015em;
            text-align: start;
        }
        .boi-reader-article h5, .boi-reader-article h6 {
            margin-top: 1.5em;
            margin-bottom: 0.4em;
            font-weight: 600;
            text-align: start;
        }
        .boi-reader-article :is(h1, h2, h3, h4, h5, h6) {
            scroll-margin-top: 5.5rem;
        }
        .boi-reader-article pre {
            border: 1px solid ${settings.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
        }
        @media (prefers-reduced-motion: no-preference) {
            .boi-reader-article {
                scroll-behavior: smooth;
            }
        }
        ::selection {
            background-color: ${settings.theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
            color: inherit;
        }
    `;

    if (!mounted) {
        return (
            <div
                style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", backgroundColor: COLORS.light.bg }}
                className="text-neutral-500"
            >
                <span className="inline-block h-9 w-9 border-2 border-primary/35 border-t-primary rounded-full animate-spin" aria-hidden />
                <p className="text-sm text-neutral-500 tracking-wide">Preparing reader…</p>
                <span className="sr-only">Loading reader</span>
            </div>
        );
    }

    return (
        <div
            ref={shellRef}
            style={wrapperStyle}
            className="antialiased overflow-x-hidden selection:bg-primary/15 min-h-[100dvh]"
        >
            <style>{settingsCSS}</style>

            {/* Top Bar */}
            <header
                style={headerStyle}
                className="fixed top-0 left-0 right-0 h-[3.75rem] pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b z-40 flex items-center justify-between gap-3 px-3 sm:px-5 md:px-8 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
                <div className="flex items-center shrink-0 gap-0.5 rounded-2xl bg-black/[0.035] p-1 ring-1 ring-black/[0.05] dark:bg-white/[0.04] dark:ring-white/[0.08]">
                    <Link
                        href="/library"
                        style={{ color: c.muted }}
                        className="p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                        aria-label="Back to Library"
                    >
                        <span className="material-icons text-[22px]" aria-hidden="true">arrow_back</span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setSectionsOpen(false);
                            setTocOpen(true);
                        }}
                        style={{ color: c.muted }}
                        className="p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                        aria-label="Book chapters (shortcut: T)"
                    >
                        <span className="material-icons text-[22px]" aria-hidden="true">menu_book</span>
                    </button>
                    {hasSectionNav && (
                        <button
                            type="button"
                            onClick={() => {
                                setTocOpen(false);
                                setSectionsOpen(true);
                            }}
                            style={{ color: c.muted }}
                            className="p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                            aria-label="Sections in this chapter (shortcut: S)"
                        >
                            <span className="material-icons text-[22px]" aria-hidden="true">subject</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center select-none min-w-0 flex-1 px-2">
                    <span
                        style={{ color: c.muted }}
                        className="text-[11px] sm:text-xs font-medium tracking-wide truncate max-w-[min(100%,18rem)] text-center opacity-90"
                    >
                        {bookTitle}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-primary truncate max-w-[min(100%,16rem)] text-center mt-0.5">
                        {chapterLabel}
                    </span>
                </div>

                <div className="flex items-center shrink-0 gap-0.5">
                    <button
                        type="button"
                        onClick={() => void toggleFullscreen()}
                        style={{ color: c.muted }}
                        className={`p-2.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                            isFullscreen
                                ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                                : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                        }`}
                        aria-pressed={isFullscreen}
                        aria-label={isFullscreen ? "Exit fullscreen (shortcut: F)" : "Fullscreen (shortcut: F)"}
                    >
                        <span className="material-icons text-[22px]" aria-hidden="true">
                            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPanelOpen((o) => !o)}
                        className={`shrink-0 p-2.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                            panelOpen
                                ? "bg-primary text-white shadow-md shadow-primary/25"
                                : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                        }`}
                        style={panelOpen ? undefined : { color: c.muted }}
                        aria-expanded={panelOpen}
                        aria-label="Reader settings"
                    >
                        <span className="material-icons text-[22px]" aria-hidden="true">tune</span>
                    </button>
                </div>
            </header>

            {/* Reading Area */}
            <main className="relative min-h-screen pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5.75rem+env(safe-area-inset-bottom))] flex justify-center px-4 sm:px-6 md:px-8">
                <article
                    className="boi-reader-article w-full max-w-[min(42rem,100%)] md:max-w-[44rem] pb-14 md:pb-20 overflow-x-hidden wrap-break-word mx-auto"
                >
                    <>
                        <header className="mb-10 md:mb-12 text-center max-w-[min(42rem,100%)] mx-auto">
                            <span className="text-primary/80 font-display text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-5 block">
                                {chapterArticle.ordinalLine}
                            </span>
                            <h2 className="font-serif-reading text-[1.65rem] sm:text-3xl md:text-4xl font-bold leading-[1.2] text-balance px-1">
                                {chapterArticle.chapterTitle}
                            </h2>
                            <div className="mt-6 flex justify-center">
                                <div className="h-px w-16 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
                            </div>
                        </header>
                        {chapterArticle.isMarkdown ? (
                            <ChapterMarkdown content={displayBody} />
                        ) : (
                            <div className="mx-auto w-full max-w-[min(42rem,100%)]">
                                <ChapterContent
                                    chapterNumber={chapterArticle.plainChapterNumberLabel}
                                    chapterTitle={chapterArticle.chapterTitle}
                                    paragraphs={splitContent(displayBody)}
                                    hideHeader
                                />
                            </div>
                        )}
                    </>
                </article>

                {panelOpen && (
                    <SettingsPanel
                        settings={settings}
                        onChange={handleSettingsChange}
                        onClose={() => setPanelOpen(false)}
                        translation={{
                            sourceLang,
                            setSourceLang,
                            targetLang,
                            setTargetLang,
                            onTranslate: () => void runTranslate(),
                            loading: translateLoading,
                            error: translateError,
                            showTranslated,
                            setShowTranslated,
                            hasTranslation: translatedText !== null,
                        }}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <footer
                style={headerStyle}
                className="fixed bottom-0 left-0 right-0 min-h-[4.25rem] pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl border-t z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
            >
                <div className="max-w-2xl mx-auto min-h-[3.5rem] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5">
                    {prevHref ? (
                        <Link
                            href={prevHref}
                            style={{ borderColor: c.border, color: c.text }}
                            className="flex items-center gap-1 min-h-[44px] px-3 sm:px-4 rounded-xl border bg-black/[0.03] dark:bg-white/[0.05] hover:border-primary/45 hover:text-primary text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98]"
                        >
                            <span className="material-icons text-xl shrink-0" aria-hidden="true">chevron_left</span>
                            <span className="hidden sm:inline max-w-[5.5rem] md:max-w-none truncate">Prev</span>
                        </Link>
                    ) : (
                        <div className="w-14 sm:w-24 shrink-0" aria-hidden />
                    )}

                    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[11rem] sm:max-w-[15rem] mx-0.5 rounded-2xl px-2.5 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-inset ring-black/[0.05] dark:ring-white/[0.08]">
                        <div className="flex items-center gap-1.5 mb-1 w-full justify-center">
                            <span style={{ color: c.muted }} className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-80 hidden sm:inline">
                                Book
                            </span>
                            <span style={{ color: c.muted }} className="text-[10px] sm:text-xs font-bold tabular-nums tracking-tight">
                                {Math.round(progress.percentage)}%
                            </span>
                            {chapterPosition && chapterPosition.total > 0 && (
                                <span style={{ color: c.muted }} className="text-[10px] sm:text-xs opacity-75 tabular-nums hidden sm:inline">
                                    · Ch {chapterPosition.current}/{chapterPosition.total}
                                </span>
                            )}
                        </div>
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: settings.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)" }}
                            role="progressbar"
                            aria-valuenow={Math.round(progress.percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Book progress"
                        >
                            <div
                                className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out shadow-sm shadow-primary/30"
                                style={{ width: `${Math.min(100, progress.percentage)}%` }}
                            />
                        </div>
                    </div>

                    {nextHref ? (
                        <Link
                            href={nextHref}
                            className="flex items-center gap-1 min-h-[44px] px-4 sm:px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/25 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 active:scale-[0.98]"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="material-icons text-xl shrink-0" aria-hidden="true">chevron_right</span>
                        </Link>
                    ) : (
                        <div className="w-14 sm:w-24 shrink-0" aria-hidden />
                    )}
                </div>
            </footer>

            <TOCSidebar
                bookId={bookId}
                currentChapterId={currentChapterId}
                chapters={chapters}
                open={tocOpen}
                onClose={() => setTocOpen(false)}
                readerTheme={settings.theme}
            />

            {hasSectionNav && resolvedSectionHeadings && (
                <SectionOutlineSidebar
                    headings={resolvedSectionHeadings}
                    open={sectionsOpen}
                    onClose={() => setSectionsOpen(false)}
                    readerTheme={settings.theme}
                />
            )}
        </div>
    );
}
