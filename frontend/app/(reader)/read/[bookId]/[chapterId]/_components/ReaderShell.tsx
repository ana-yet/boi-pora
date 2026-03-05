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

const DEFAULTS: ReaderSettings = {
    theme: "light",
    font: "serif",
    fontSize: 20,
    spacing: "normal",
};

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
    compact: "1.6",
    normal: "1.85",
    loose: "2.15",
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
        bg: "#f8f7f6",
        text: "#4a4036",
        muted: "#8c8075",
        headerBg: "rgba(248,247,246,0.97)",
        border: "#e5ddd5",
    },
    dark: {
        bg: "#141414",
        text: "#d4d4d4",
        muted: "#737373",
        headerBg: "rgba(20,20,20,0.97)",
        border: "#333333",
    },
    sepia: {
        bg: "#f5e6c8",
        text: "#3b2a14",
        muted: "#8a7560",
        headerBg: "rgba(245,230,200,0.97)",
        border: "#d4be94",
    },
};

interface ReaderShellProps {
    bookTitle: string;
    chapterLabel: string;
    progress: { currentPage: number; totalPages: number; percentage: number };
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
        }
        .boi-reader-article p,
        .boi-reader-article li,
        .boi-reader-article td,
        .boi-reader-article th,
        .boi-reader-article blockquote,
        .boi-reader-article figcaption {
            line-height: ${SPACING_MAP[settings.spacing]} !important;
        }
    `;

    if (!mounted) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
                <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div style={wrapperStyle} className="antialiased overflow-x-hidden">
            <style>{settingsCSS}</style>

            {/* Top Bar */}
            <header
                style={headerStyle}
                className="fixed top-0 left-0 right-0 h-14 backdrop-blur-md border-b z-40 flex items-center justify-between px-4 md:px-6"
            >
                <div className="flex items-center gap-0.5">
                    <Link
                        href="/library"
                        style={{ color: c.muted }}
                        className="p-2 rounded-lg hover:text-primary transition-colors"
                        aria-label="Back to Library"
                    >
                        <span className="material-icons text-xl" aria-hidden="true">arrow_back</span>
                    </Link>
                    <button
                        onClick={() => setTocOpen(true)}
                        style={{ color: c.muted }}
                        className="p-2 rounded-lg hover:text-primary transition-colors"
                        aria-label="Table of Contents"
                    >
                        <span className="material-icons text-xl" aria-hidden="true">toc</span>
                    </button>
                </div>

                <div className="flex flex-col items-center select-none">
                    <span style={{ color: c.muted }} className="text-xs font-medium tracking-wide truncate max-w-[200px]">
                        {bookTitle}
                    </span>
                    <span className="text-[11px] text-primary font-semibold">
                        {chapterLabel}
                    </span>
                </div>

                <button
                    onClick={() => setPanelOpen((o) => !o)}
                    className={`px-2 pt-1 rounded-md transition-colors ${panelOpen ? "bg-primary text-white" : "hover:text-primary"}`}
                    style={panelOpen ? undefined : { color: c.muted }}
                    aria-label="Reader settings"
                >
                    <span className="material-icons text-xl" aria-hidden="true">tune</span>
                </button>
            </header>

            {/* Reading Area */}
            <main className="relative min-h-screen pt-24 pb-28 flex justify-center">
                <article
                    className="boi-reader-article w-full max-w-[640px] px-6 md:px-0 overflow-hidden wrap-break-word"
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
                className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-md border-t z-40"
            >
                <div className="max-w-3xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
                    {prevHref ? (
                        <Link
                            href={prevHref}
                            style={{ color: c.muted }}
                            className="flex items-center gap-1 hover:text-primary transition-colors text-sm"
                        >
                            <span className="material-icons text-lg" aria-hidden="true">chevron_left</span>
                            <span className="hidden sm:inline font-medium">Previous</span>
                        </Link>
                    ) : (
                        <div className="w-20" />
                    )}

                    <div className="flex flex-col items-center flex-1 max-w-[200px] mx-4">
                        <span style={{ color: c.muted }} className="text-[10px] mb-1.5 tabular-nums">
                            {Math.round(progress.percentage)}%
                        </span>
                        <div
                            className="w-full h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: settings.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}
                        >
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>

                    {nextHref ? (
                        <Link
                            href={nextHref}
                            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="material-icons text-lg" aria-hidden="true">chevron_right</span>
                        </Link>
                    ) : (
                        <div className="w-20" />
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
