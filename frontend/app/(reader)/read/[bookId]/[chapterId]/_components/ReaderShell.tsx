"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { SettingsPanel } from "./SettingsPanel";

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
    spacing: "loose",
};

const FONT_MAP: Record<ReaderFont, string> = {
    serif: "var(--font-serif-reading)",
    sans: "var(--font-display)",
    mono: "'Courier New', monospace",
};

const SPACING_MAP: Record<ReaderSpacing, string> = {
    compact: "1.6",
    normal: "1.8",
    loose: "2.0",
};

const WRAPPER_THEME: Record<ReaderTheme, string> = {
    light: "bg-background-light text-neutral-800",
    dark: "bg-background-dark text-neutral-200",
    sepia: "bg-sepia-bg text-sepia-text",
};

const HEADER_THEME: Record<ReaderTheme, string> = {
    light: "bg-background-light/95 border-primary/10",
    dark: "bg-background-dark/95 border-white/5",
    sepia: "bg-sepia-bg/95 border-sepia-text/10",
};

const FOOTER_THEME: Record<ReaderTheme, string> = {
    light: "bg-white/90 border-neutral-300",
    dark: "bg-background-dark/95 border-neutral-800",
    sepia: "bg-sepia-bg/90 border-sepia-text/10",
};

interface ReaderShellProps {
    bookTitle: string;
    chapterLabel: string;
    progress: { currentPage: number; totalPages: number; percentage: number };
    prevHref?: string;
    nextHref?: string;
    children: ReactNode;
}

export function ReaderShell({
    bookTitle,
    chapterLabel,
    progress,
    prevHref,
    nextHref,
    children,
}: ReaderShellProps) {
    const [panelOpen, setPanelOpen] = useState(false);
    const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);

    const contentStyle: CSSProperties = {
        fontSize: `${settings.fontSize}px`,
        lineHeight: SPACING_MAP[settings.spacing],
        fontFamily: FONT_MAP[settings.font],
    };

    const trackBg =
        settings.theme === "dark" ? "bg-white/10" : "bg-black/10";

    return (
        <div
            className={`min-h-screen transition-colors duration-300 antialiased overflow-x-hidden ${WRAPPER_THEME[settings.theme]}`}
        >
            {/* Top Bar */}
            <header
                className={`fixed top-0 left-0 right-0 h-16 backdrop-blur-sm border-b z-40 flex items-center justify-between px-6 transition-all duration-300 ${HEADER_THEME[settings.theme]}`}
            >
                <Link
                    href="/library"
                    className="p-2 rounded-lg hover:bg-primary/10 opacity-60 hover:opacity-100 hover:text-primary transition-all group"
                    aria-label="Back to Library"
                >
                    <span className="material-icons group-hover:-translate-x-1 transition-transform">
                        arrow_back
                    </span>
                </Link>

                <div className="flex flex-col items-center opacity-80">
                    <h1 className="text-sm font-medium tracking-wide uppercase opacity-60 font-display">
                        {bookTitle}
                    </h1>
                    <span className="text-xs text-primary font-semibold">
                        {chapterLabel}
                    </span>
                </div>

                <button
                    onClick={() => setPanelOpen((o) => !o)}
                    className={`p-2 rounded-lg transition-colors ${
                        panelOpen
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                    }`}
                    aria-label="Reader settings"
                >
                    <span className="material-icons">settings</span>
                </button>
            </header>

            {/* Reading Area */}
            <main className="relative min-h-screen pt-24 pb-32 flex justify-center">
                <article
                    className="w-full max-w-[650px] px-6 md:px-0"
                    style={contentStyle}
                >
                    {children}
                </article>

                {panelOpen && (
                    <SettingsPanel
                        settings={settings}
                        theme={settings.theme}
                        onChange={setSettings}
                        onClose={() => setPanelOpen(false)}
                    />
                )}
            </main>

            {/* Bottom Navigation */}
            <footer
                className={`fixed bottom-0 left-0 right-0 h-20 backdrop-blur border-t z-40 ${FOOTER_THEME[settings.theme]}`}
            >
                <div className="max-w-4xl mx-auto h-full flex items-center justify-between px-6">
                    {prevHref ? (
                        <>
                            <Link
                                href={prevHref}
                                className="hidden md:flex items-center gap-2 opacity-60 hover:text-primary transition-colors group"
                            >
                                <span className="material-icons text-xl group-hover:-translate-x-1 transition-transform">
                                    chevron_left
                                </span>
                                <span className="font-display font-medium text-sm">
                                    Prev Chapter
                                </span>
                            </Link>
                            <Link
                                href={prevHref}
                                className="md:hidden p-2 rounded-full hover:bg-primary/10 opacity-60"
                            >
                                <span className="material-icons">
                                    chevron_left
                                </span>
                            </Link>
                        </>
                    ) : (
                        <div />
                    )}

                    <div className="flex flex-col items-center flex-1 max-w-xs mx-4">
                        <div className="w-full flex justify-between text-xs opacity-50 mb-2 font-display">
                            <span>
                                Page {progress.currentPage} of{" "}
                                {progress.totalPages}
                            </span>
                            <span>{progress.percentage}%</span>
                        </div>
                        <div
                            className={`w-full h-1.5 ${trackBg} rounded-full overflow-hidden`}
                        >
                            <div
                                className="h-full bg-primary rounded-full relative overflow-hidden"
                                style={{
                                    width: `${progress.percentage}%`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>

                    {nextHref ? (
                        <>
                            <Link
                                href={nextHref}
                                className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0 font-display font-medium text-sm"
                            >
                                Next Chapter
                                <span className="material-icons text-xl">
                                    chevron_right
                                </span>
                            </Link>
                            <Link
                                href={nextHref}
                                className="md:hidden p-2 rounded-full bg-primary text-white shadow-lg shadow-primary/20"
                            >
                                <span className="material-icons">
                                    chevron_right
                                </span>
                            </Link>
                        </>
                    ) : (
                        <div />
                    )}
                </div>
            </footer>
        </div>
    );
}
