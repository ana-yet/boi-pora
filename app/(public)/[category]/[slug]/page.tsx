import Link from "next/link";

const relatedBooks = [
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDkM1RewNMRkU4mJM4bMQyoIhBCWEJm74kHVGuoexFfedbstMzNMOOeQQGcvqSN6VBm2zy2V13FXs7v3lA6IYYvptNG9JUkBwbmrM9zZGW5aiwIP4TFVk2AGLP5XibeVbx_wV3VZ39qvpbH5fgDnlH_ddzs4EIrotgSmqKWdFqeHe6Xl4Cgc_G-6rs9WHgr4GTCBV5g8tWpwOJfqwkuzEANPzxMtpC3n0YV9P7I8IZ3BqHXnX2RBWuo8stbsIohI0pzcVJHrpOGJoXq",
        imageAlt: "Book cover with orange abstract art",
    },
    {
        title: "Life of Pi",
        author: "Yann Martel",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDohSoOtGvQXpVppedZJimCun3VYvIALc9NCNxvL10OeL6GQs0Vk8ZxZLGwoUKvppaYIw49vorFczL_Is2PWWDlDFHZW-dzEVByTZo2YTWVV0OMQCR9aeOw1hYNq13BdzaErNq7RfZrIJ-E3V5tIEwfXxbaZ66sYMK_QFP1eUxHK_yitfJQcxvdl7jMY3CgocnDIAxfUpZVYvLk33EO7dhtRrC_OiTOyLZojEMeB2I2M_LNRc2G27pYhV51y1-XHetdldHlSe2z9NDk",
        imageAlt: "Book cover featuring silhouette of a person",
    },
    {
        title: "Circe",
        author: "Madeline Miller",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC3wltAP-E3JrsXbGmQYP6mOLSMCg75b3yLr8Jzb7TtmyGGevCxKWB-jZyPVpnG5X8AGElSkVRc3SzWfB8BpQrdeTu5Mf38EHL2x02DIkzy4qtNma7ic1WcMpHaMPNRO26M52RF3aQZdhlKQrJmhmq6Z8SVrJqMwUlC4QW3yaVpuJvQ36XrP43cPERMadzNDjto1o1gmwaywMMl_PwV49ScT0BjhS49b0i9eI4qsp6byQt4wL30NABycmDELRC7qSjq1r5j6a3JDfHK",
        imageAlt: "Minimalist blue book cover",
    },
    {
        title: "Norwegian Wood",
        author: "Haruki Murakami",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDvg9cOEoGu9d9kT4sDFpJn6ayZfy57fTn67YA1ly4S_1zqacJus-v3I6MaFEQIKQMhGoVGbss6kCZVPk51VypqZC7C5jJJsm_WMnMssns0rC7-HaXC3eM8EOC3UhE_ooYjeB8QgrKA3CWnoG1X65CNFn6wygZ0zzH8PNYYktOy7y-xcVrIm1m6jawTvZokAK5Sli727UImsYr_2vOB8BhTTVj5MXIzxn1VmviJBT90Y5Fb9COULgQi2gFlZ_Tn3hFyvo4XO3xM0tUH",
        imageAlt: "Vintage book spine and cover",
    },
    {
        title: "Educated",
        author: "Tara Westover",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAj8tYPrSRoisCOVh-1hFY6EQZjRT3B9s2E6Zs3aeIkxR_8WCeB3_tpNh92J4j2SVxa0FsTW6kGV3-LOiO5HeXaeZq_o9vK-OvU_1_zuRwlg2XmUOlQXSnTOkj2-2RNKv__6-W0CYH7ZIgpLHQ_K00NpIKQw8_xIIv1KsAbbCXY_fWWe7289s2xKRFMliAQJsrj7S57Tx0V0oGifE5YvEI7nEYKYtspyAtLW8IdRGlweeltu_o9EPlKSVVqXLgutrvKLx6yq2E9NG3Q",
        imageAlt: "White book cover on table",
    },
    {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB5Dpd8QdvP5vmtZFs7EA6o_Tp0XWR8DsX-qns2d1PFuYw2WdOiVPqTYlTHKm2VQKnlgf6Ky1b4-mAAkcLryBH9efp0DiV3iEwtzH7r-iiK__PhfZvtFe1YU1Ftx0-Z2A1v05CHq9oz1mxqV5KfEtKwrjx-CuVdlmcGxciTNCBAq_ruyqSkopT1j5Y7HQEySCOtOmY1unPPV6pCdsx00RlfvCgsg0MGY1PruItxhR5jwsMEO8CUInsgb3m9NRLDxVx05raxvwKdz1Mh",
        imageAlt: "Stack of colorful books",
    },
];

const genres = ["Fiction", "Fantasy", "Contemporary", "Philosophical"];

export default function BookDetail() {
    return (
        <main>
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-8">
                <Link className="hover:text-primary transition-colors" href="/">
                    Library
                </Link>
                <span className="material-icons text-base mx-2 text-slate-300">chevron_right</span>
                <Link className="hover:text-primary transition-colors" href="/">
                    Fiction
                </Link>
                <span className="material-icons text-base mx-2 text-slate-300">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">The Midnight Library</span>
            </div>

            {/* Book Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                {/* Left Column: Book Cover */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center lg:items-start">
                    <div className="relative group w-[280px] sm:w-[320px] lg:w-full aspect-[2/3] rounded-xl shadow-2xl shadow-primary/10 overflow-hidden transform transition-transform duration-500 hover:scale-[1.02]">
                        <img
                            alt="Book Cover Art"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaIYejBlDIXPm2SvKwb5DwsBFyYzA28Nlg6ls4UC9RR3f4tltlVmMsevzwfUm6Sc7SDpBWg0eBvR50Yw2lEefT9PwkabXqUhhwR_x9R2a3J4sGVrfCQTrr0L7Rda6STHydUakgCvuGcFNoQ4t4GZ_5X_A15BsI-YQY8J-dGHav2b4WUU1jHSv1tONtJwrGhmrUc6ObNqHc_wizquwLJDJRHTc4ycvE0__pj3mdqUk6Je6eyIHi0JQu_eT4p60cArOfIkjtXWgMqKE6"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    {/* Preview Button Mobile Only */}
                    <button className="mt-6 w-full lg:hidden flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium shadow-sm">
                        <span className="material-icons text-primary">visibility</span>
                        Free Preview
                    </button>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-start pt-2">
                    {/* Header Info */}
                    <div className="mb-6">
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
                            The Midnight Library
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-lg">
                            <span className="text-slate-500 dark:text-slate-400">by</span>
                            <a
                                className="text-primary hover:text-primary/80 font-medium underline decoration-2 decoration-primary/30 hover:decoration-primary underline-offset-4 transition-all"
                                href="#"
                            >
                                Matt Haig
                            </a>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-6 sm:gap-10 mb-8 border-y border-slate-200 dark:border-slate-800 py-6">
                        {/* Rating */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center text-yellow-400 gap-1">
                                <span className="material-icons text-xl">star</span>
                                <span className="material-icons text-xl">star</span>
                                <span className="material-icons text-xl">star</span>
                                <span className="material-icons text-xl">star</span>
                                <span className="material-icons text-xl text-slate-300 dark:text-slate-600">star_half</span>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">4.5 (12.4k reviews)</span>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700"></div>

                        {/* Pages */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-icons text-xl">menu_book</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">304</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Pages</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700"></div>

                        {/* Time */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-icons text-xl">schedule</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">5h 12m</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Read Time</p>
                            </div>
                        </div>
                    </div>

                    {/* Synopsis */}
                    <div className="mb-10 max-w-3xl">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Synopsis</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-light">
                            Between life and death there is a library, and within that library, the shelves go on forever. Every book
                            provides a chance to try another life you could have lived. To see how things would be if you had made
                            other choices... Would you have done anything different, if you had the chance to undo your regrets? A
                            dazzling novel about all the choices that go into a life well lived.
                        </p>
                    </div>

                    {/* Genre Tags */}
                    <div className="flex flex-wrap gap-3 mb-10">
                        {genres.map((genre) => (
                            <a
                                key={genre}
                                className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                                href="#"
                            >
                                {genre}
                            </a>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95">
                            <span className="material-icons">play_arrow</span>
                            Start Reading
                        </button>
                        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 text-slate-700 dark:text-slate-200 hover:text-primary rounded-lg font-semibold transition-all active:scale-95">
                            <span className="material-icons">bookmark_add</span>
                            Add to Library
                        </button>
                        <button
                            className="sm:ml-auto p-4 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Share"
                        >
                            <span className="material-icons">share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Books Section */}
            <div className="mt-24 border-t border-slate-200 dark:border-slate-800 pt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related Books</h2>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className="material-icons text-sm">arrow_back</span>
                        </button>
                        <button className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory">
                    {relatedBooks.map((book) => (
                        <Link
                            href="/book/the-midnight-library"
                            key={book.title}
                            className="flex-none w-[180px] snap-start group cursor-pointer"
                        >
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                                <img alt={book.imageAlt} className="w-full h-full object-cover" src={book.imageUrl} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>

    );
}
