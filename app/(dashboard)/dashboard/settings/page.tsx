import { PageHeader } from "@/app/components/shared";

export default function SettingsPage() {
    return (
        <div className="animate-fade-in">
            <PageHeader
                title="সেটিংস"
                description="আপনার অ্যাকাউন্ট সেটিংস পরিবর্তন করুন"
            />
            <div className="max-w-2xl">
                <p className="text-muted">সেটিংস পেজ শীঘ্রই আসছে...</p>
            </div>
        </div>
    );
}
