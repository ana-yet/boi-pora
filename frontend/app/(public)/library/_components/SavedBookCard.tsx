export interface SavedBook {
    title: string;
    author: string;
    image: string;
}

export function SavedBookCard({ book }: { book: SavedBook }) {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[2/3] mb-3 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden bg-neutral-200">
                <img
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={book.image}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-primary">
                    <span className="material-icons text-lg">play_arrow</span>
                </button>
            </div>
            <h4 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors text-neutral-800 dark:text-white">
                {book.title}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {book.author}
            </p>
        </div>
    );
}
