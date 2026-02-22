import { Button } from "@/app/components/ui";

export default function HomePage() {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                            আপনার পড়ার{" "}
                            <span className="text-primary">নতুন যাত্রা</span>{" "}
                            শুরু হোক
                        </h1>
                        <p className="mt-6 text-lg text-muted leading-relaxed">
                            হাজারো বই আবিষ্কার করুন, আপনার লাইব্রেরি তৈরি করুন, এবং পাঠকদের
                            সম্প্রদায়ের সাথে যুক্ত হন। বই পড়া — আপনার ডিজিটাল পড়ার সঙ্গী।
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button size="lg">শুরু করুন</Button>
                            <Button variant="outline" size="lg">
                                আরও জানুন
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 -z-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
            </section>

            {/* Features Section */}
            <section className="bg-surface border-y border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-foreground">কেন বই পড়া?</h2>
                        <p className="mt-3 text-muted max-w-lg mx-auto">
                            আপনার পড়ার অভিজ্ঞতা সহজ এবং আনন্দময় করতে আমরা এখানে।
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "📚",
                                title: "বিশাল সংগ্রহ",
                                desc: "হাজারো বাংলা ও ইংরেজি বই এক জায়গায়।",
                            },
                            {
                                icon: "🔖",
                                title: "ব্যক্তিগত লাইব্রেরি",
                                desc: "আপনার পছন্দের বই সংরক্ষণ ও ট্র্যাক করুন।",
                            },
                            {
                                icon: "👥",
                                title: "পাঠক সম্প্রদায়",
                                desc: "অন্যান্য পাঠকদের সাথে আলোচনা ও মতামত ভাগ করুন।",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="text-center p-8 rounded-2xl bg-background border border-border hover:shadow-lg hover:border-border-strong hover:-translate-y-1 transition-all duration-300"
                            >
                                <span className="text-4xl mb-4 block">{feature.icon}</span>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
