"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await api.post("/api/v1/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to send reset link.");
        } finally {
            setIsLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-icons text-3xl text-primary">
                        mark_email_read
                    </span>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                        Check your email
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        If an account exists for <strong>{email}</strong>, we
                        sent a reset link. It may take a few minutes to arrive.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm"
                >
                    <span className="material-icons text-lg">arrow_back</span>
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-center gap-2">
                    <span className="material-icons text-lg">error_outline</span>
                    {error}
                </div>
            )}
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Enter your email and we&apos;ll send you a link to reset your
                password.
            </p>
            <div className="space-y-1.5">
                <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                    Email address
                </label>
                <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                ) : (
                    <span className="material-icons text-lg">send</span>
                )}
                {isLoading ? "Sending..." : "Send reset link"}
            </button>
            <p className="text-center">
                <Link
                    href="/login"
                    className="text-sm text-neutral-600 hover:text-primary transition-colors"
                >
                    Back to sign in
                </Link>
            </p>
        </form>
    );
}
