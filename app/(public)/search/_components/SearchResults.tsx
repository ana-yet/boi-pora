import Link from "next/link";

// Mock results — replace with real API/DB in production
const MOCK_BOOKS = [
    { title: "The Midnight Library", author: "Matt Haig", slug: "the-midnight-library", category: "fiction", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaIYejBlDIXPm2SvKwb5DwsBFyYzA28Nlg6ls4UC9RR3f4tltlVmMsevzwfUm6Sc7SDpBWg0eBvR50Yw2lEefT9PwkabXqUhhwR_x9R2a3J4sGVrfCQTrr0L7Rda6STHydUakgCvuGcFNoQ4t4GZ_5X_A15BsI-YQY8J-dGHav2b4WUU1jHSv1tONtJwrGhmrUc6ObNqHc_wizquwLJDJRHTc4ycvE0__pj3mdqUk6Je6eyIHi0JQu_eT4p60cArOfIkjtXWgMqKE6", rating: "4.5" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", slug: "great-gatsby", category: "fiction", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzuoO6QUj95kVFZhloHrVHvSRdAPqFEVyyJdkT2RBpjydphiKAF2PG2_5ZuP9Pid3a07mKlyZkCnbATvrem7kWaYeF_Hp-HKf7utqgPVUxb0GquQdP_MU_JN6Rokz0Ib1muMfPjkt7JY1fRatBfdLBOUTG2YBSnH5oLxzEtc2Sp4gVZrrbluC4SsxFjp7FsFg_YupYW8sS0eDOwQZRrj-Qa4MUCmVyQ6Pxg6WCPQPecr44sZQDyW9CurJzdY0cBFqVu6Xb5ziZwEHI", rating: "4.8" },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", slug: "thinking-fast-and-slow", category: "nonfiction", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsi6xz-Vd3kf5NUTf9agPa0n5nWWXkk8Mhqy2IH-vMRDab3IpzzO2NLkUm3qx1maW-0XTJ6Slf7TcajkY7b5TMTY2RnLaOL0xdUhmcgmLr2dtXKNRWJHX0_wKVGNRoNbO3VwMjoujYCkJ9D78-7hzV74LuvA9Zgvu0UjLAQAZ3L4DNxRtuzrUGXaU8ZaIi3GVV6kQhzmadUs6gqJKDcjbkRrbw2opZnlIbHoOmFyabBZuSwVjA_cTJ8iw0VFufyQ_wAGpIxCEr--sd", rating: "4.6" },
    { title: "Dune", author: "Frank Herbert", slug: "dune", category: "fiction", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsdeVWVbUgJZiN1TnjTSGYXJN5wAsJ8zJL0s9UW3ZLVmLB4BB6wn8ccjNqXkCKS23vIH1Tv8ACrYRgRYCGvBvMzfQzKydH9hdh9fnKb0N_-pN5jjFlJL_XLD-d_Zix_X5MNGRC-zoaXBi9cyI-FMpLYfl06ekqClEWXToI_Mil_r8nVJhjYJ-wL9xcP1k87TotbPygpVU8n7xQNC3gYwnaB5U6VUhyLNzdsOujFZRAbZF9qP50JRzitPIfbv2acH8mm0SfxVgIduVg", rating: "4.7" },
];

function getResults(query: string) {
    const lower = query.toLowerCase();
    return MOCK_BOOKS.filter(
        (b) =>
            b.title.toLowerCase().includes(lower) ||
            b.author.toLowerCase().includes(lower)
    );
}

export function SearchResults({ query }: { query: string }) {
    const results = getResults(query);

    return (
        <section>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {results.length} result{results.length !== 1 ? "s" : ""} for
                &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <span className="material-icons text-5xl text-neutral-400 mb-4 block">
                        menu_book
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                        No books found.
                    </p>
                    <p className="text-sm text-neutral-500">
                        Try a different search term or browse{" "}
                        <Link href="/explore" className="text-primary hover:underline">
                            Explore
                        </Link>
                        .
                    </p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((book) => (
                        <li key={book.slug}>
                            <Link
                                href={`/${book.category}/${book.slug}`}
                                className="group flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                                    <img
                                        alt=""
                                        className="w-full h-full object-cover"
                                        src={book.image}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-neutral-800 dark:text-white group-hover:text-primary transition-colors truncate">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {book.author}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                        <span className="material-icons text-primary text-sm">
                                            star
                                        </span>
                                        {book.rating}
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
