export function Hero() {
    return (
        <section className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-white mb-6 tracking-tight leading-tight">
                Find Your Next <span className="text-primary">Favorite Book</span>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 font-light">
                Discover millions of stories, from timeless classics to modern masterpieces.
            </p>
            <form action="/search" method="get" className="relative max-w-2xl mx-auto group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white dark:bg-surface-dark rounded-full shadow-soft p-2 border border-neutral-200 dark:border-neutral-700">
                    <span className="material-icons text-neutral-400 ml-4 text-2xl">search</span>
                    <input name="q" className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-lg placeholder-neutral-400 text-neutral-800 dark:text-white" placeholder="Search by title, author, or ISBN..." type="search" />
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg shadow-primary/30">
                        Search
                    </button>
                </div>
            </form>
        </section>
    );
}
