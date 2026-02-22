export function RecommendationRow() {
    const books = [
        {
            title: "The Martian",
            author: "Andy Weir",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwS7q1ZqmfvqiYdqi7cKBVcYrzRbMEETimCQlxNPnIsrPUyYXETiukQu0eFQeqTm5F-iZru1k-ky_hBzJpuudQJszUaGhXpxuJ-vaoDMbKhC1sUJKuongxaJW_Z5AdhwM8hQEmlRFyxoQUCXddJ3Tqi12LAuuSjaZw0vfvMAr-qtWzKcNvo3nqUL51PhNbawor_HYetTaCf6qLgOsOfFCmUBj0QmqfDQElab07hRupFzH4QWwpyY0zjeL83Bp5cQxvIMDKR2Wn9lfI",
            rating: "4.8",
            time: "10h 25m",
            classes: ""
        },
        {
            title: "Project Hail Mary",
            author: "Andy Weir",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYLtIQ2XGxUnojFH8E_Y6wMhB_JHRCG2B3e9x3yDZeK1ATSF-KOGsDbm4c-I0HHnhsZFCPz93m2av_J8hJIbIC7gijFjpOd4SmWxjA17sYlXbRkdf4WpJP_6K1jIE0jnJ5SYmglO3snQ7BZfE_ikvwH7invQsyaQ9gfjbhWeANZSWs1Otw9zL6sakCorjIX3gGcw4KFZyKK0iwZ2ac8RnuyqvTKgyFncJoasTBhgjzNfOcib_zVVwdGBAlWtXSIJsUZHwf1McTBr73",
            rating: "4.9",
            time: "12h 10m",
            classes: ""
        },
        {
            title: "Neuromancer",
            author: "William Gibson",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD12EmaFhQV9Ct47kTReJC_hB9euq6NGsk9Aqi3h8kXXtATAwikv448pmg3lCJkT12YAF2259g_liFKTwBWRgxywKXY3etqGMzwCL5ZgoEFzpTNOc1nu26H0BZv52YuyjoH_Tec59FrWzCW3L52pEjfcs9eD7LvwqN-XivOKvCG-UkO2zz_erxnvtBUMl5rHeT5p6U4wWb_EHBrL6gnhHJ0zkGYW5D316FbMs75gRMPyHisexhdXv0KDesFy4fM884kqmLIzhNfPaj0",
            rating: "4.6",
            time: "8h 45m",
            classes: ""
        },
        {
            title: "Foundation",
            author: "Isaac Asimov",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm1APWgP6Yk-nXyyGVvXIKr5jToMOrOk8i5CUxYNM6d1xpDvHv9_mc9X1cD-H4gZyF0W3AvzroZShpD8xSnQ25m9nY33lkTfTLZMAz0DaMv9rXlGxIdxl3imZjBJ3_ZH3_9sKZ8NInJXmYzHRN83kC2xPFMLIWElya2_AmVL2yGB0xs4tbXcF1Ac4T_VIzkai6lm_zie7Q3FFW9WVf4ADayPR-Qs6q-N9bmoj7WPdMuvwZ9JdtCzJeUQXxcszogqV0ifyoBW-neLxY",
            rating: "4.7",
            time: "9h 15m",
            classes: "hidden md:block"
        },
        {
            title: "Hyperion",
            author: "Dan Simmons",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo_3HtKqGFyFQU0RyFAV7SHUrvjOZD9fYdkrMU8Nme7cewtIJN5Ymd5LwB12IEtB-nsGnyUeHD6Uo_Pz9mLfa4uJyUUy95GOFUNJfN_5zSpx3YylEibGS3ZFNpBWsbXHz3qHT8PX5J3iWgEKi4jU1f1d8m9Vq1yGVM1SqinPGDuyb0mUfZcLY3RxClSYmqENfL31H7Ab5TJyePXWks1Tq_qWgBSfUfUdbTsrazdkUorbZW2HJ84iITjYMd4rBuFu4tVEFTiLI_0nF4",
            rating: "4.8",
            time: "14h 30m",
            classes: "hidden lg:block"
        }
    ];

    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
                        Because you read <span className="text-primary">Sci-Fi</span>
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Curated picks based on your reading history</p>
                </div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                        <span className="material-icons text-sm">arrow_back</span>
                    </button>
                    <button className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                        <span className="material-icons text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book, idx) => (
                    <div key={idx} className={`group cursor-pointer ${book.classes}`}>
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                            <img alt={`${book.title} book cover`} className="w-full h-full object-cover" src={book.image} />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <span className="material-icons text-[10px] text-primary">star</span> {book.rating}
                            </div>
                        </div>
                        <h3 className="font-bold text-neutral-800 dark:text-white text-base leading-tight mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{book.author}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                            <span className="material-icons text-[14px]">schedule</span> {book.time}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
