"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { Toast, type ToastVariant } from "@/app/components/ui/Toast";

interface ToastState {
    message: ReactNode;
    variant: ToastVariant;
    open: boolean;
}

const ToastContext = createContext<{
    showToast: (message: ReactNode, variant?: ToastVariant) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastState>({
        message: "",
        variant: "default",
        open: false,
    });

    const showToast = useCallback(
        (message: ReactNode, variant: ToastVariant = "default") => {
            setToast({ message, variant, open: true });
        },
        []
    );

    const closeToast = useCallback(() => {
        setToast((p) => ({ ...p, open: false }));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast
                message={toast.message}
                variant={toast.variant}
                open={toast.open}
                onClose={closeToast}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return {
            showToast: () => {},
        };
    }
    return ctx;
}
