import Link from "next/link";
import { Button, Input } from "@/app/components/ui";

export default function RegisterPage() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg animate-scale-in">
            <h1 className="text-2xl font-bold text-foreground text-center">রেজিস্টার করুন</h1>
            <p className="mt-2 text-sm text-muted text-center">
                নতুন অ্যাকাউন্ট তৈরি করুন
            </p>

            <form className="mt-8 space-y-5">
                <Input
                    label="পুরো নাম"
                    type="text"
                    placeholder="আপনার নাম"
                    required
                />
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
                <Input
                    label="পাসওয়ার্ড নিশ্চিত করুন"
                    type="password"
                    placeholder="••••••••"
                    required
                />
                <Button className="w-full" size="lg">
                    রেজিস্টার
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
                ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    লগইন করুন
                </Link>
            </p>
        </div>
    );
}
