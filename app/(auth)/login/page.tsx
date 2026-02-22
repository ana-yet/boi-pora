import Link from "next/link";
import { Button, Input } from "@/app/components/ui";

export default function LoginPage() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg animate-scale-in">
            <h1 className="text-2xl font-bold text-foreground text-center">লগইন করুন</h1>
            <p className="mt-2 text-sm text-muted text-center">
                আপনার অ্যাকাউন্টে প্রবেশ করুন
            </p>

            <form className="mt-8 space-y-5">
                <Input
                    label="ইমেইল"
                    type="email"
                    placeholder="example@email.com"
                    required
                />
                <Input
                    label="পাসওয়ার্ড"
                    type="password"
                    placeholder="••••••••"
                    required
                />
                <Button className="w-full" size="lg">
                    লগইন
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                অ্যাকাউন্ট নেই?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                    রেজিস্টার করুন
                </Link>
            </p>
        </div>
    );
}
