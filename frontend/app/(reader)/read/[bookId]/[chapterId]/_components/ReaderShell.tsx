"use client";

import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SettingsPanel } from "./SettingsPanel";
import { TOCSidebar } from "./TOCSidebar";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

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
    children: ReactNode;
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
    children,
}: ReaderShellProps) {
    const router = useRouter();
    const [panelOpen, setPanelOpen] = useState(false);
    const [tocOpen, setTocOpen] = useState(false);
    const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setSettings(loadSettings());
        setMounted(true);
    }, []);

    const handleSettingsChange = useCallback((newSettings: ReaderSettings) => {
        setSettings(newSettings);
        saveSettings(newSettings);
    }, []);

    useKeyboardShortcuts({
        arrowleft: () => prevHref && router.push(prevHref),
        arrowright: () => nextHref && router.push(nextHref),
        t: () => setTocOpen((o) => !o),
        escape: () => { setTocOpen(false); setPanelOpen(false); },
    });

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

    const settingsCSS = `
        .boi-reader-article {
            font-size: ${settings.fontSize}px;
            font-family: ${FONT_MAP[settings.font]};
            color: ${c.text};
            text-align: justify;
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
        ::selection {
            background-color: ${settings.theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
            color: inherit;
        }
    `;

    if (!mounted) {
        return (
            <div
                style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.light.bg }}
                className="text-neutral-500"
            >
                <span className="inline-block h-9 w-9 border-2 border-primary/40 border-t-primary rounded-full animate-spin" aria-hidden />
                <span className="sr-only">Loading reader</span>
            </div>
        );
    }

    return (
        <div style={wrapperStyle} className="antialiased overflow-x-hidden selection:bg-primary/15">
            <style>{settingsCSS}</style>

            {/* Top Bar */}
            <header
                style={headerStyle}
                className="fixed top-0 left-0 right-0 h-[3.75rem] pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b z-40 flex items-center justify-between gap-3 px-3 sm:px-5 md:px-8 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
                <div className="flex items-center shrink-0 gap-0.5">
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
                        onClick={() => setTocOpen(true)}
                        style={{ color: c.muted }}
                        className="p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                        aria-label="Table of contents (shortcut: T)"
                    >
                        <span className="material-icons text-[22px]" aria-hidden="true">menu_book</span>
                    </button>
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
            </header>

            {/* Reading Area */}
            <main className="relative min-h-screen pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] flex justify-center px-4 sm:px-6">
                <article
                    className="boi-reader-article w-full max-w-[min(42rem,100%)] md:max-w-[44rem] pb-8 overflow-hidden wrap-break-word"
                >
                    {children}
                </article>

                {panelOpen && (
                    <SettingsPanel
                        settings={settings}
                        onChange={handleSettingsChange}
                        onClose={() => setPanelOpen(false)}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <footer
                style={headerStyle}
                className="fixed bottom-0 left-0 right-0 min-h-[4.25rem] pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl border-t z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
            >
                <div className="max-w-2xl mx-auto min-h-[3.5rem] flex items-center justify-between gap-3 px-3 sm:px-5">
                    {prevHref ? (
                        <Link
                            href={prevHref}
                            style={{ borderColor: c.border, color: c.text }}
                            className="flex items-center gap-1 min-h-[44px] px-3 sm:px-4 rounded-xl border bg-black/[0.02] dark:bg-white/[0.04] hover:border-primary/40 hover:text-primary text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            <span className="material-icons text-xl shrink-0" aria-hidden="true">chevron_left</span>
                            <span className="hidden sm:inline max-w-[5.5rem] md:max-w-none truncate">Prev</span>
                        </Link>
                    ) : (
                        <div className="w-14 sm:w-24 shrink-0" aria-hidden />
                    )}

                    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[12rem] sm:max-w-[14rem] mx-1">
                        <div className="flex items-center gap-2 mb-1.5 w-full justify-center">
                            <span style={{ color: c.muted }} className="text-[10px] sm:text-xs font-semibold tabular-nums tracking-tight">
                                {Math.round(progress.percentage)}%
                            </span>
                            {chapterPosition && chapterPosition.total > 0 && (
                                <span style={{ color: c.muted }} className="text-[10px] sm:text-xs opacity-80 tabular-nums hidden sm:inline">
                                    · Ch {chapterPosition.current}/{chapterPosition.total}
                                </span>
                            )}
                        </div>
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08]"
                            style={{ backgroundColor: settings.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
                            role="progressbar"
                            aria-valuenow={Math.round(progress.percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Book progress"
                        >
                            <div
                                className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
                                style={{ width: `${Math.min(100, progress.percentage)}%` }}
                            />
                        </div>
                    </div>

                    {nextHref ? (
                        <Link
                            href={nextHref}
                            className="flex items-center gap-1 min-h-[44px] px-4 sm:px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
        </div>
    );
}
