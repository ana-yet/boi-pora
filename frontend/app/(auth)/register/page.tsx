import type { Metadata } from "next";
import Link from "next/link";
import { SocialButtons } from "../_components";
import { RegisterForm } from "./_components";

export const metadata: Metadata = {
    title: "Create Account",
    description:
        "Join Boi Pora — your personal digital library. Start reading for free.",
};

export default function RegisterPage() {
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
                    Start your reading journey
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Create a free account and discover thousands of books.
                </p>
            </div>

            {/* Social Buttons */}
            <SocialButtons action="register" />

            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    or register with email
                </span>
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Register Form */}
            <RegisterForm />

            {/* Login link */}
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
