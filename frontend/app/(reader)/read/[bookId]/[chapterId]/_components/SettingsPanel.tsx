"use client";

import type { CSSProperties } from "react";
import {
    READER_SETTINGS_DEFAULTS,
    type ReaderSettings,
    type ReaderTheme,
    type ReaderFont,
    type ReaderSpacing,
} from "./ReaderShell";

interface PanelColors {
    bg: string;
    headerBg: string;
    border: string;
    controlBg: string;
    controlActiveBg: string;
    text: string;
    muted: string;
    trackBg: string;
}

const PANEL_COLORS: Record<ReaderTheme, PanelColors> = {
    light: {
        bg: "#fdfbf9",
        headerBg: "#f3eee9",
        border: "#e5ddd5",
        controlBg: "#f3eee9",
        controlActiveBg: "#fdfbf9",
        text: "#4a4036",
        muted: "#8c8075",
        trackBg: "#e5ddd5",
    },
    dark: {
        bg: "#242424",
        headerBg: "#1c1c1c",
        border: "#3a3a3a",
        controlBg: "#1a1a1a",
        controlActiveBg: "#444444",
        text: "#e0e0e0",
        muted: "#808080",
        trackBg: "#333",
    },
    sepia: {
        bg: "#faf0d7",
        headerBg: "#f0e2c4",
        border: "#d4be94",
        controlBg: "#ebe0cc",
        controlActiveBg: "#faf0d7",
        text: "#3b2a14",
        muted: "#8a7560",
        trackBg: "#d4be94",
    },
};

interface SettingsPanelProps {
    settings: ReaderSettings;
    onChange: (s: ReaderSettings) => void;
    onClose: () => void;
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
    const update = (partial: Partial<ReaderSettings>) =>
        onChange({ ...settings, ...partial });

    const pc = PANEL_COLORS[settings.theme];

    const panelStyle: CSSProperties = {
        backgroundColor: pc.bg,
        borderColor: pc.border,
        color: pc.text,
    };

    return (
        <>
            <div
                className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] motion-safe:transition-opacity"
                onClick={onClose}
                aria-hidden
            />
            <aside
                style={panelStyle}
                className="fixed right-2 sm:right-4 top-[calc(3.75rem+0.75rem+env(safe-area-inset-top))] w-[min(20rem,calc(100vw-1rem))] max-h-[min(32rem,calc(100vh-6rem))] rounded-2xl shadow-xl border z-40 flex flex-col overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
            >
                <div style={{ backgroundColor: pc.headerBg, borderColor: pc.border }} className="px-4 py-3.5 border-b shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm tracking-tight">Reading settings</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ color: pc.muted }}
                            className="p-1.5 rounded-xl hover:text-primary hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Close settings"
                        >
                            <span className="material-icons text-lg" aria-hidden="true">close</span>
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto overscroll-contain flex-1 min-h-0">
                    {/* Theme */}
                    <section>
                        <SectionLabel text="Theme" muted={pc.muted} />
                        <div className="grid grid-cols-3 gap-2">
                            {THEME_OPTIONS.map((t) => {
                                const active = settings.theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => update({ theme: t.id })}
                                        style={{
                                            backgroundColor: active ? "transparent" : pc.controlBg,
                                            borderColor: active ? "var(--color-primary)" : "transparent",
                                        }}
                                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border"
                                            style={{ backgroundColor: t.swatchBg, borderColor: t.swatchBorder }}
                                        />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Typeface */}
                    <section>
                        <SectionLabel text="Typeface" muted={pc.muted} />
                        <div className="space-y-1">
                            {FONT_OPTIONS.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => update({ font: f.id })}
                                    style={{ backgroundColor: settings.font === f.id ? pc.controlBg : "transparent" }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                >
                                    <span style={{ fontFamily: f.family }}>{f.label}</span>
                                    {settings.font === f.id && (
                                        <span className="material-icons text-primary text-sm" aria-hidden="true">check</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Font Size */}
                    <section>
                        <SectionLabel text={`Font Size — ${settings.fontSize}px`} muted={pc.muted} />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => update({ fontSize: Math.max(14, settings.fontSize - 2) })}
                                style={{ backgroundColor: pc.controlBg }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-serif transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                aria-label="Decrease font size"
                            >
                                A
                            </button>
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min={14}
                                    max={30}
                                    step={1}
                                    value={settings.fontSize}
                                    onChange={(e) => update({ fontSize: Number(e.target.value) })}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-primary) ${((settings.fontSize - 14) / 16) * 100}%, ${pc.trackBg} ${((settings.fontSize - 14) / 16) * 100}%)`,
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => update({ fontSize: Math.min(30, settings.fontSize + 2) })}
                                style={{ backgroundColor: pc.controlBg }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-lg font-serif transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                aria-label="Increase font size"
                            >
                                A
                            </button>
                        </div>
                    </section>

                    {/* Line Spacing */}
                    <section>
                        <SectionLabel text="Line Spacing" muted={pc.muted} />
                        <div className="grid grid-cols-3 p-1 rounded-lg" style={{ backgroundColor: pc.controlBg }}>
                            {SPACING_OPTIONS.map((opt) => {
                                const active = settings.spacing === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => update({ spacing: opt.id })}
                                        style={{
                                            backgroundColor: active ? pc.controlActiveBg : "transparent",
                                            color: active ? "var(--color-primary)" : pc.muted,
                                            boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                        }}
                                        className="py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    >
                                        {opt.title}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div style={{ borderColor: pc.border }} className="px-4 py-3 border-t shrink-0">
                    <button
                        type="button"
                        onClick={() => onChange({ ...READER_SETTINGS_DEFAULTS })}
                        style={{ color: pc.muted }}
                        className="w-full py-2 text-xs font-medium rounded-lg hover:text-primary hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        Reset to defaults
                    </button>
                </div>
            </aside>
        </>
    );
}

function SectionLabel({ text, muted }: { text: string; muted: string }) {
    return (
        <h4 style={{ color: muted }} className="text-[11px] font-semibold uppercase tracking-wider mb-2">
            {text}
        </h4>
    );
}

const THEME_OPTIONS: { id: ReaderTheme; label: string; swatchBg: string; swatchBorder: string }[] = [
    { id: "light", label: "Light", swatchBg: "#f8f7f6", swatchBorder: "#d5cdc5" },
    { id: "dark", label: "Dark", swatchBg: "#141414", swatchBorder: "#555" },
    { id: "sepia", label: "Sepia", swatchBg: "#f5e6c8", swatchBorder: "#c4a870" },
];

const FONT_OPTIONS: { id: ReaderFont; label: string; family: string }[] = [
    { id: "serif", label: "Merriweather", family: "'Merriweather', serif" },
    { id: "sans", label: "Work Sans", family: "'Work Sans', sans-serif" },
    { id: "mono", label: "Monospace", family: "'Courier New', monospace" },
];

const SPACING_OPTIONS: { id: ReaderSpacing; title: string }[] = [
    { id: "compact", title: "Tight" },
    { id: "normal", title: "Normal" },
    { id: "loose", title: "Loose" },
];
