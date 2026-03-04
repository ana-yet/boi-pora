"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { PasswordInput } from "../../_components/PasswordInput";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordMismatch =
        confirmPassword.length > 0 && password !== confirmPassword;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (passwordMismatch) return;
        setError(null);
        setIsLoading(true);
        try {
            await api.post(`/api/v1/auth/reset-password/${token}`, { password });
            setSuccess(true);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Failed to reset password. The link may be invalid or expired."
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <div className="space-y-8">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                    <span className="material-icons text-primary text-3xl">
                        auto_stories
                    </span>
                    <span className="font-bold text-2xl tracking-tight text-neutral-800 dark:text-white">
                        Boi Pora
                    </span>
                </div>
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <span className="material-icons text-3xl text-green-600 dark:text-green-400">
                            check_circle
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                            Password reset successful
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                            Your password has been updated. You can now sign in
                            with your new password.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm"
                    >
                        <span className="material-icons text-lg">login</span>
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <span className="material-icons text-primary text-3xl">
                    auto_stories
                </span>
                <span className="font-bold text-2xl tracking-tight text-neutral-800 dark:text-white">
                    Boi Pora
                </span>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
                    Reset your password
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Enter a new password for your account.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-center gap-2">
                        <span className="material-icons text-lg">error_outline</span>
                        {error}
                    </div>
                )}
                <PasswordInput
                    label="New password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                />
                <PasswordInput
                    label="Confirm new password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    error={passwordMismatch ? "Passwords don't match" : undefined}
                />
                <button
                    type="submit"
                    disabled={isLoading || passwordMismatch || !password}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="material-icons text-lg">lock_reset</span>
                    )}
                    {isLoading ? "Resetting..." : "Reset password"}
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
        </div>
    );
}
