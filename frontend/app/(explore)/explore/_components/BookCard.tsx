export interface Book {
    title: string;
    author: string;
    image: string;
    rating: string;
    duration: string;
    tags: { label: string; variant?: "default" | "accent" }[];
}

export function BookCard({ book }: { book: Book }) {
    return (
        <div className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
                <img
                    alt={`${book.title} cover`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    src={book.image}
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="material-icons text-primary text-sm">
                        star
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-white">
                        {book.rating}
                    </span>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons text-xs">timer</span>
                    <span className="text-xs font-medium">{book.duration}</span>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        By {book.author}
                    </p>
                    <div className="flex gap-2 mb-4">
                        {book.tags.map((tag) => (
                            <span
                                key={tag.label}
                                className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md ${
                                    tag.variant === "accent"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                                }`}
                            >
                                {tag.label}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2">
                    Read Sample
                </button>
            </div>
        </div>
    );
}
