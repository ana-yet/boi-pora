import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./_components";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your Boi Pora account and continue reading.",
};

export default function LoginPage() {
    return (
        <div className="space-y-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <span className="material-icons text-primary text-3xl">
                    auto_stories
                </span>
                <span className="font-bold text-2xl tracking-tight text-neutral-800 dark:text-white">
                    Boi Pora
                </span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
                    Welcome back
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Sign in to pick up where you left off.
                </p>
            </div>

            {/* Login Form */}
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />}>
                <LoginForm />
            </Suspense>

            {/* Register link */}
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                    Create one free
                </Link>
            </p>
        </div>
    );
}
