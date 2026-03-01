"use client";

import type {
    ReaderSettings,
    ReaderTheme,
    ReaderFont,
    ReaderSpacing,
} from "./ReaderShell";

const PANEL_BG: Record<ReaderTheme, string> = {
    light: "bg-white border-neutral-200",
    dark: "bg-surface-dark border-neutral-800",
    sepia: "bg-[#fdf6e3] border-[#e8dcc5]",
};

const PANEL_HEADER_BG: Record<ReaderTheme, string> = {
    light: "bg-neutral-100/50 border-neutral-200",
    dark: "bg-background-dark/50 border-neutral-800",
    sepia: "bg-[#f0e6d3]/50 border-[#e8dcc5]",
};

const CONTROL_BG: Record<ReaderTheme, string> = {
    light: "bg-neutral-100",
    dark: "bg-neutral-800",
    sepia: "bg-[#f0e6d3]",
};

const MUTED: Record<ReaderTheme, string> = {
    light: "text-neutral-600",
    dark: "text-neutral-400",
    sepia: "text-[#8a7a6b]",
};

interface SettingsPanelProps {
    settings: ReaderSettings;
    theme: ReaderTheme;
    onChange: (s: ReaderSettings) => void;
    onClose: () => void;
}

export function SettingsPanel({
    settings,
    theme,
    onChange,
    onClose,
}: SettingsPanelProps) {
    const update = (partial: Partial<ReaderSettings>) =>
        onChange({ ...settings, ...partial });

    const muted = MUTED[theme];

    return (
        <aside
            className={`fixed right-4 top-20 bottom-24 w-80 rounded-2xl shadow-2xl border z-30 flex flex-col overflow-hidden transition-colors ${PANEL_BG[theme]}`}
        >
            {/* Header */}
            <div
                className={`p-5 border-b backdrop-blur ${PANEL_HEADER_BG[theme]}`}
            >
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">
                        Display Settings
                    </h3>
                    <button
                        onClick={onClose}
                        className={`${muted} hover:text-primary transition-colors`}
                    >
                        <span className="material-icons text-xl">close</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Settings */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                {/* Theme */}
                <ThemeSection
                    current={settings.theme}
                    controlBg={CONTROL_BG[theme]}
                    muted={muted}
                    onSelect={(t) => update({ theme: t })}
                />

                {/* Typeface */}
                <TypefaceSection
                    current={settings.font}
                    controlBg={CONTROL_BG[theme]}
                    muted={muted}
                    onSelect={(f) => update({ font: f })}
                />

                {/* Size & Spacing */}
                <SizeSection
                    fontSize={settings.fontSize}
                    spacing={settings.spacing}
                    controlBg={CONTROL_BG[theme]}
                    muted={muted}
                    onFontSize={(s) => update({ fontSize: s })}
                    onSpacing={(s) => update({ spacing: s })}
                />
            </div>

            {/* Reset */}
            <div
                className={`p-4 border-t ${PANEL_HEADER_BG[theme]}`}
            >
                <button
                    onClick={() =>
                        onChange({
                            theme: "light",
                            font: "serif",
                            fontSize: 20,
                            spacing: "loose",
                        })
                    }
                    className={`w-full py-2 text-xs font-semibold ${muted} hover:text-primary transition-colors uppercase tracking-wider`}
                >
                    Reset to Defaults
                </button>
            </div>
        </aside>
    );
}

/* ─── Sub-sections ─── */

function ThemeSection({
    current,
    controlBg,
    muted,
    onSelect,
}: {
    current: ReaderTheme;
    controlBg: string;
    muted: string;
    onSelect: (t: ReaderTheme) => void;
}) {
    const themes: { id: ReaderTheme; label: string; bg: string; swatch: string }[] = [
        { id: "light", label: "Light", bg: "bg-background-light text-neutral-800", swatch: "bg-white border-neutral-300" },
        { id: "dark", label: "Dark", bg: "bg-background-dark text-neutral-200", swatch: "bg-neutral-800 border-neutral-700" },
        { id: "sepia", label: "Sepia", bg: "bg-sepia-bg text-sepia-text", swatch: "bg-[#fdf6e3] border-[#e8dcc5]" },
    ];

    return (
        <section>
            <h4 className={`text-xs font-bold ${muted} uppercase tracking-wider mb-3`}>
                Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${t.bg} ${
                            current === t.id
                                ? "border-primary"
                                : `border-transparent hover:border-neutral-300`
                        }`}
                    >
                        <div
                            className={`w-6 h-6 rounded-full border shadow-sm ${t.swatch}`}
                        />
                        <span className="text-xs font-medium">{t.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

function TypefaceSection({
    current,
    controlBg,
    muted,
    onSelect,
}: {
    current: ReaderFont;
    controlBg: string;
    muted: string;
    onSelect: (f: ReaderFont) => void;
}) {
    const fonts: { id: ReaderFont; label: string; className: string }[] = [
        { id: "serif", label: "Merriweather", className: "font-serif-reading text-lg" },
        { id: "sans", label: "Work Sans", className: "font-display text-lg" },
        { id: "mono", label: "Mono", className: "font-mono text-base" },
    ];

    return (
        <section>
            <h4 className={`text-xs font-bold ${muted} uppercase tracking-wider mb-3`}>
                Typeface
            </h4>
            <div className="space-y-2">
                {fonts.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => onSelect(f.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                            current === f.id
                                ? controlBg
                                : `hover:${controlBg}`
                        }`}
                    >
                        <span className={f.className}>{f.label}</span>
                        {current === f.id && (
                            <span className="material-icons text-primary text-sm">
                                check_circle
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

function SizeSection({
    fontSize,
    spacing,
    controlBg,
    muted,
    onFontSize,
    onSpacing,
}: {
    fontSize: number;
    spacing: ReaderSpacing;
    controlBg: string;
    muted: string;
    onFontSize: (s: number) => void;
    onSpacing: (s: ReaderSpacing) => void;
}) {
    const MIN = 14;
    const MAX = 30;
    const pct = ((fontSize - MIN) / (MAX - MIN)) * 100;

    const spacingOptions: { id: ReaderSpacing; icon: string; title: string }[] = [
        { id: "compact", icon: "density_small", title: "Compact" },
        { id: "normal", icon: "density_medium", title: "Normal" },
        { id: "loose", icon: "density_large", title: "Loose" },
    ];

    return (
        <section>
            <h4 className={`text-xs font-bold ${muted} uppercase tracking-wider mb-4`}>
                Size & Spacing
            </h4>

            {/* Font Size */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => onFontSize(Math.max(MIN, fontSize - 2))}
                    className="text-sm font-serif-reading opacity-60 hover:opacity-100 transition-opacity p-1"
                    aria-label="Decrease font size"
                >
                    A
                </button>
                <div className="flex-1 h-2 bg-black/10 rounded-full relative cursor-pointer">
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow hover:scale-110 transition-transform"
                        style={{ left: `calc(${pct}% - 8px)` }}
                    />
                </div>
                <button
                    onClick={() => onFontSize(Math.min(MAX, fontSize + 2))}
                    className="text-xl font-serif-reading opacity-60 hover:opacity-100 transition-opacity p-1"
                    aria-label="Increase font size"
                >
                    A
                </button>
            </div>

            {/* Line Spacing */}
            <div className={`grid grid-cols-3 ${controlBg} p-1 rounded-lg`}>
                {spacingOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onSpacing(opt.id)}
                        title={opt.title}
                        className={`py-2 rounded transition-colors ${
                            spacing === opt.id
                                ? "bg-white shadow-sm text-primary dark:bg-neutral-700"
                                : `${muted} hover:opacity-80`
                        }`}
                    >
                        <span className="material-icons text-lg">
                            {opt.icon}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}
