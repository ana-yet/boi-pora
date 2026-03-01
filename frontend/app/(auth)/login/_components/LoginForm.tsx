"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "../../_components/PasswordInput";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
                <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                    Email address
                </label>
                <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-neutral-300 dark:hover:border-neutral-600"
                />
            </div>

            {/* Password */}
            <PasswordInput
                label="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary/30 transition-colors"
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                        Remember me
                    </span>
                </label>
                <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                ) : (
                    <span className="material-icons text-lg">login</span>
                )}
                {isLoading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}
