import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./_components";

export const metadata: Metadata = {
    title: "Forgot Password",
    description: "Reset your Boi Pora account password.",
};

export default function ForgotPasswordPage() {
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
                    Forgot password?
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    No worries. Enter your email and we&apos;ll send a reset
                    link.
                </p>
            </div>
            <ForgotPasswordForm />
        </div>
    );
}
