import { PageHeader } from "@/app/components/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui";

export default function DashboardPage() {
    return (
        <div className="animate-fade-in">
            <PageHeader
                title="ড্যাশবোর্ড"
                description="আপনার পড়ার কার্যকলাপের সারসংক্ষেপ"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "পড়া হয়েছে", value: "0", icon: "✅" },
                    { title: "পড়া চলছে", value: "0", icon: "📖" },
                    { title: "পছন্দ তালিকা", value: "0", icon: "❤️" },
                ].map((stat) => (
                    <Card key={stat.title} hover>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{stat.title}</CardTitle>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
