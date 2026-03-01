import Link from "next/link";

export function AuthPanel() {
    return (
        <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] relative bg-gradient-to-br from-primary via-primary-dark to-[#a85500] overflow-hidden flex-col">
            {/* Floating decorative shapes */}
            <div
                className="absolute top-[15%] left-[10%] w-32 h-44 bg-white/[0.07] rounded-2xl rotate-[-12deg] animate-float"
                style={{ animationDelay: "0s", animationDuration: "7s" }}
            />
            <div
                className="absolute top-[45%] right-[8%] w-24 h-36 bg-white/[0.05] rounded-2xl rotate-[8deg] animate-float"
                style={{ animationDelay: "2s", animationDuration: "8s" }}
            />
            <div
                className="absolute bottom-[20%] left-[20%] w-20 h-28 bg-white/[0.06] rounded-xl rotate-[-6deg] animate-float"
                style={{ animationDelay: "4s", animationDuration: "9s" }}
            />
            <div
                className="absolute top-[10%] right-[25%] w-16 h-16 bg-white/[0.04] rounded-full animate-float"
                style={{ animationDelay: "1s", animationDuration: "6s" }}
            />
            <div
                className="absolute bottom-[35%] right-[30%] w-12 h-12 bg-white/[0.05] rounded-full animate-float"
                style={{ animationDelay: "3s", animationDuration: "10s" }}
            />

            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-3 text-white group"
                >
                    <span className="material-icons text-3xl group-hover:scale-110 transition-transform">
                        auto_stories
                    </span>
                    <span className="font-bold text-2xl tracking-tight">
                        Boi Pora
                    </span>
                </Link>

                {/* Quote */}
                <div className="flex-1 flex items-center">
                    <div className="max-w-sm">
                        <div className="w-12 h-1 bg-white/30 rounded-full mb-8" />
                        <blockquote className="text-white/90 text-3xl xl:text-4xl font-serif-reading italic leading-snug mb-6">
                            &ldquo;A reader lives a thousand lives before he
                            dies.&rdquo;
                        </blockquote>
                        <p className="text-white/50 text-sm font-display font-medium tracking-wide">
                            &mdash; George R.R. Martin
                        </p>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <img
                        alt="Testimonial avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhB1_eyG5dNlBp-E6g9G1nyom5cVNmkz802sNG9wM74qcsiOU2WzxG1--q6xYL2FfsoPJlowmqcWt-ULbZ-m-_kY621qrmJaJF8z0akNqegL--L4rJrYOMps1bIZhQ3Moc0NEtF3sbODwsNvFP4lKq6Lq9QxecojzKP7E5u4htLQ7uMf39CbY_rt_Xapy0Ret3mXx2qgklwGUP8xyKeiHbEUjwmUa51V_Avu9cb1UuUlynfKkmZLBlFpP37eXOdTgFT4p-k961qNkl"
                    />
                    <div>
                        <p className="text-white/80 text-sm italic leading-relaxed">
                            &ldquo;Best reading platform I&apos;ve ever
                            used.&rdquo;
                        </p>
                        <p className="text-white/40 text-xs mt-1 font-medium">
                            Sarah J. &mdash; Premium Member
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
