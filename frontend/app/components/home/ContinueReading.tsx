export function ContinueReading() {
    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Continue Reading</h2>
                <a className="text-primary hover:text-primary-dark text-sm font-medium flex items-center" href="#">
                    View all <span className="material-icons text-sm ml-1">arrow_forward</span>
                </a>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-card overflow-hidden border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row max-w-4xl">
                <div className="w-full md:w-1/3 relative h-64 md:h-auto">
                    <img
                        alt="Book cover of Dune showing desert landscape"
                        className="absolute inset-0 w-full h-full object-cover"
                        data-alt="Book cover art showing abstract desert landscape"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa44GhaoUbE5g-pkwTz9Ku22MU3fVh8FXCHrx2EOOq541cbUI-vsuswvqZLV8bb49xRwN6dzXUGUs7WEiR6E2L8lm9idLFrnFe0S_ZH_cKoegiN3144knyX98NbOwV7n89KO6wBPWjbgeI4cP4CliIKJ2C8r-FsvHxNDx6PGHguPjSnQH2iVwMCvuWGWU9DyUj7aY0R-afHOiyJjDAed84JFqCpRA3jMSb2HqvCgkS5pkEctkVqj_z1BQRrdMqjPaBoRb4z_QX0B-_"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10"></div>
                </div>
                <div className="p-8 md:w-2/3 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1 block">Currently Reading</span>
                            <h3 className="text-3xl font-bold text-neutral-800 dark:text-white mb-1">Dune</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">Frank Herbert</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-medium">Sci-Fi</div>
                    </div>
                    <div className="mt-6 mb-8">
                        <div className="flex justify-between text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">
                            <span>Progress</span>
                            <span>75%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full shadow-[0_0_10px_rgba(236,127,19,0.5)]" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">Last read: 2 hours ago • 2h 15m remaining</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                            <span className="material-icons text-xl">play_arrow</span> Resume
                        </button>
                        <button className="bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-4 py-3 rounded-xl font-medium transition-colors">
                            <span className="material-icons text-xl">bookmark_border</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
