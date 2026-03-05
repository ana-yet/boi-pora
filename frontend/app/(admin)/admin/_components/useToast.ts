"use client";

import { useState, useCallback } from "react";
import type { ToastVariant } from "@/app/components/ui/Toast";

interface ToastState {
  open: boolean;
  message: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    variant: "default",
  });

  const show = useCallback((message: string, variant: ToastVariant = "success") => {
    setToast({ open: true, message, variant });
  }, []);

  const close = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return { toast, show, close };
}
