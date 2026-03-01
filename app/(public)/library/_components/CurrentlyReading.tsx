import { ProgressBar } from "./ProgressBar";

const currentBook = {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Psychology",
    startedAgo: "3 days ago",
    chapter: "Chapter 14: The Availability Heuristic",
    progress: 64,
    pagesRemaining: 142,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsi6xz-Vd3kf5NUTf9agPa0n5nWWXkk8Mhqy2IH-vMRDab3IpzzO2NLkUm3qx1maW-0XTJ6Slf7TcajkY7b5TMTY2RnLaOL0xdUhmcgmLr2dtXKNRWJHX0_wKVGNRoNbO3VwMjoujYCkJ9D78-7hzV74LuvA9Zgvu0UjLAQAZ3L4DNxRtuzrUGXaU8ZaIi3GVV6kQhzmadUs6gqJKDcjbkRrbw2opZnlIbHoOmFyabBZuSwVjA_cTJ8iw0VFufyQ_wAGpIxCEr--sd",
};

export function CurrentlyReading() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-800 dark:text-white">
                    <span className="material-icons text-primary">
                        menu_book
                    </span>
                    Currently Reading
                </h2>
                <a
                    className="text-sm text-primary font-medium hover:underline"
                    href="#"
                >
                    View Reading Log
                </a>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-shrink-0 group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                        <div className="w-40 h-60 rounded-lg shadow-book overflow-hidden relative bg-neutral-200">
                            <img
                                alt={`${currentBook.title} cover`}
                                className="w-full h-full object-cover"
                                src={currentBook.image}
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/20 to-transparent" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                    {currentBook.category}
                                </span>
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Started {currentBook.startedAgo}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1 leading-tight text-neutral-800 dark:text-white">
                                {currentBook.title}
                            </h3>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4 font-light">
                                {currentBook.author}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end justify-between text-sm mb-1">
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                    {currentBook.chapter}
                                </span>
                                <span className="text-primary font-bold">
                                    {currentBook.progress}%
                                </span>
                            </div>

                            <ProgressBar value={currentBook.progress} />

                            <div className="flex justify-between items-center pt-2">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {currentBook.pagesRemaining} pages remaining
                                </p>
                                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 active:scale-95 flex items-center gap-2">
                                    Continue Reading
                                    <span className="material-icons text-sm">
                                        arrow_forward
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
