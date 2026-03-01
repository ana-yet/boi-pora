"use client";

import { createContext, useContext, ReactNode } from "react";

/**
 * Example: App-wide context provider.
 * Replace with real auth/state logic when ready.
 */

interface AppContextType {
    appName: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const value: AppContextType = {
        appName: "বই পড়া",
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
