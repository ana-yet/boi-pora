"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export interface SavedBook {
    title: string;
    author: string;
    image: string;
    slug?: string;
    bookId?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3C/svg%3E";

export function SavedBookCard({ book, onRemove }: { book: SavedBook; onRemove?: () => void }) {
    const [removing, setRemoving] = useState(false);
    const href = book.slug ? `/fiction/${book.slug}` : book.bookId ? `/read/${book.bookId}/chapter-1` : "#";

    async function handleRemove(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!book.bookId || removing) return;
        setRemoving(true);
        try {
            await api.delete(`/api/v1/library/${book.bookId}`);
            onRemove?.();
        } catch {}
        setRemoving(false);
    }

    return (
        <Link href={href} className="group cursor-pointer block">
            <div className="relative aspect-[2/3] mb-3 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden bg-neutral-200">
                <img
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={book.image || PLACEHOLDER}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Remove from library"
                >
                    <span className="material-icons text-lg">{removing ? "hourglass_empty" : "close"}</span>
                </button>
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
        </Link>
    );
}
