"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProgressBar } from "./ProgressBar";

export interface SavedBook {
    title: string;
    author: string;
    image: string;
    slug?: string;
    bookId?: string;
    category?: string;
    progress?: number;
    addedAt?: string;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3C/svg%3E";

interface SavedBookCardProps {
    book: SavedBook;
    onRemove?: () => void;
    view?: "grid" | "list";
}

export function SavedBookCard({ book, onRemove, view = "grid" }: SavedBookCardProps) {
    const [removing, setRemoving] = useState(false);

    const href = book.slug && book.category
        ? `/${book.category}/${book.slug}`
        : book.slug
            ? `/fiction/${book.slug}`
            : "#";

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

    if (view === "list") {
        return (
            <Link
                href={href}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-primary/30 transition-all"
            >
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-neutral-200 shadow-sm">
                    <img
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        src={book.image || PLACEHOLDER}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-neutral-800 dark:text-white truncate group-hover:text-primary transition-colors">
                        {book.title}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{book.author}</p>
                    {book.progress != null && book.progress > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 max-w-[120px]">
                                <ProgressBar value={book.progress} />
                            </div>
                            <span className="text-[10px] font-medium text-primary">{book.progress}%</span>
                        </div>
                    )}
                </div>
                {book.addedAt && (
                    <span className="text-[10px] text-neutral-400 hidden sm:block flex-shrink-0">
                        {new Date(book.addedAt).toLocaleDateString()}
                    </span>
                )}
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    title="Remove"
                >
                    <span className="material-icons text-lg">{removing ? "hourglass_empty" : "close"}</span>
                </button>
            </Link>
        );
    }

    return (
        <Link href={href} className="group cursor-pointer block">
            <div className="relative aspect-[2/3] mb-3 rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden bg-neutral-200">
                <img
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={book.image || PLACEHOLDER}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Remove from library"
                >
                    <span className="material-icons text-base">{removing ? "hourglass_empty" : "close"}</span>
                </button>
                {book.progress != null && book.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center justify-between text-white text-[10px] font-medium mb-1">
                            <span>Progress</span>
                            <span>{book.progress}%</span>
                        </div>
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${book.progress}%` }}
                            />
                        </div>
                    </div>
                )}
                {(!book.progress || book.progress === 0) && (
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 text-primary">
                        <span className="material-icons text-lg">play_arrow</span>
                    </button>
                )}
            </div>
            <h4 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors text-neutral-800 dark:text-white truncate">
                {book.title}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {book.author}
            </p>
        </Link>
    );
}
