export function CategoryGrid() {
    const categories = [
        { name: "Fiction", icon: "auto_stories" },
        { name: "Academic", icon: "school" },
        { name: "Sci-Fi", icon: "rocket_launch" },
        { name: "Self Help", icon: "psychology" },
        { name: "History", icon: "history_edu" },
        { name: "Business", icon: "trending_up" }
    ];

    return (
        <section className="mb-16">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category, idx) => (
                    <a key={idx} className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center h-32" href="#">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                            <span className="material-icons">{category.icon}</span>
                        </div>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors">{category.name}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
