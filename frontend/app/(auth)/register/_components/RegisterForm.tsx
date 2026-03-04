"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, setToken } from "@/lib/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { PasswordInput } from "../../_components/PasswordInput";

export function RegisterForm() {
    const router = useRouter();
    const { refetchUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(false);

    const passwordMismatch =
        confirmPassword.length > 0 && password !== confirmPassword;

    const strengthLabel = getStrengthLabel(password);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (passwordMismatch || !agreed) return;
        setError(null);
        setIsLoading(true);
        try {
            const res = await api.post<{ accessToken: string }>("/api/v1/auth/register", {
                name,
                email,
                password,
            });
            setToken(res.accessToken);
            await refetchUser();
            router.push("/");
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-center gap-2">
                    <span className="material-icons text-lg">error_outline</span>
                    {error}
                </div>
            )}
            {/* Full Name */}
            <div className="space-y-1.5">
                <label
                    htmlFor="reg-name"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                    Full name
                </label>
                <input
                    id="reg-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-neutral-300 dark:hover:border-neutral-600"
                />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <label
                    htmlFor="reg-email"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                    Email address
                </label>
                <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-neutral-300 dark:hover:border-neutral-600"
                />
            </div>

            {/* Password with strength */}
            <div className="space-y-2">
                <PasswordInput
                    label="Password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                />
                {password.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                        level <= strengthLabel.level
                                            ? strengthLabel.color
                                            : "bg-neutral-200 dark:bg-neutral-700"
                                    }`}
                                />
                            ))}
                        </div>
                        <span
                            className={`text-xs font-medium ${strengthLabel.textColor}`}
                        >
                            {strengthLabel.text}
                        </span>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <PasswordInput
                label="Confirm password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                error={passwordMismatch ? "Passwords don't match" : undefined}
            />

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/30 transition-colors"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    I agree to the{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                    >
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline font-medium"
                    >
                        Privacy Policy
                    </a>
                </span>
            </label>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !agreed || passwordMismatch}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                ) : (
                    <span className="material-icons text-lg">
                        person_add
                    </span>
                )}
                {isLoading ? "Creating account..." : "Create account"}
            </button>
        </form>
    );
}

function getStrengthLabel(pw: string): {
    level: number;
    text: string;
    color: string;
    textColor: string;
} {
    if (pw.length < 6)
        return {
            level: 1,
            text: "Weak",
            color: "bg-red-400",
            textColor: "text-red-500",
        };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, pw.length >= 10].filter(Boolean).length;

    if (score <= 2)
        return {
            level: 2,
            text: "Fair",
            color: "bg-amber-400",
            textColor: "text-amber-500",
        };
    if (score <= 3)
        return {
            level: 3,
            text: "Good",
            color: "bg-primary",
            textColor: "text-primary",
        };
    return {
        level: 4,
        text: "Strong",
        color: "bg-green-500",
        textColor: "text-green-600",
    };
}
