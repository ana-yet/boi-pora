"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

export interface ChapterDraft {
  chapterNumber: number;
  chapterId: string;
  title: string;
  content: string;
}

function newChapterDraft(n: number): ChapterDraft {
  return {
    chapterNumber: n,
    chapterId: `chapter-${n}`,
    title: "",
    content: "",
  };
}

export default function AdminNewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    author: "",
    description: "",
    coverImageUrl: "",
    category: "fiction",
    genres: "",
    pageCount: "",
    estimatedReadTimeMinutes: "",
    status: "published",
  });
  const [chapters, setChapters] = useState<ChapterDraft[]>([newChapterDraft(1)]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  }

  function updateChapter(i: number, field: keyof ChapterDraft, value: string | number) {
    setChapters((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === "chapterNumber") {
        next[i].chapterId = `chapter-${value}`;
      }
      return next;
    });
  }

  function addChapter() {
    const n = chapters.length + 1;
    setChapters((prev) => [...prev, newChapterDraft(n)]);
  }

  function removeChapter(i: number) {
    setChapters((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        slug: form.slug,
        author: form.author,
        description: form.description || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        category: form.category || undefined,
        status: form.status,
      };
      if (form.genres.trim()) {
        payload.genres = form.genres.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (form.pageCount) payload.pageCount = parseInt(form.pageCount, 10);
      if (form.estimatedReadTimeMinutes) {
        payload.estimatedReadTimeMinutes = parseInt(form.estimatedReadTimeMinutes, 10);
      }
      const res = await api.post<{ _id: string }>("/api/v1/books", payload);
      const bookId = res._id;
      const toCreate = chapters.filter((ch) => ch.content.trim());
      for (let i = 0; i < toCreate.length; i++) {
        const ch = toCreate[i];
        await api.post("/api/v1/chapters", {
          bookId,
          chapterNumber: ch.chapterNumber,
          chapterId: ch.chapterId,
          title: ch.title.trim() || `Chapter ${ch.chapterNumber}`,
          content: ch.content.trim(),
        });
      }
      router.push(`/admin/books/${bookId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create book");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/books"
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
        >
          <span className="material-icons">arrow_back</span>
        </Link>
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
          Add Book
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6"
      >
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Input
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          helperText="URL-friendly identifier (e.g. the-midnight-library)"
        />
        <Input
          label="Author"
          name="author"
          value={form.author}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
          />
        </div>
        <Input
          label="Cover Image URL"
          name="coverImageUrl"
          value={form.coverImageUrl}
          onChange={handleChange}
          type="url"
        />
        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="fiction">Fiction</option>
            <option value="nonfiction">Nonfiction</option>
            <option value="sci-fi">Sci-Fi</option>
          </select>
        </div>
        <Input
          label="Genres (comma-separated)"
          name="genres"
          value={form.genres}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Page Count"
            name="pageCount"
            type="number"
            min="0"
            value={form.pageCount}
            onChange={handleChange}
          />
          <Input
            label="Read Time (minutes)"
            name="estimatedReadTimeMinutes"
            type="number"
            min="0"
            value={form.estimatedReadTimeMinutes}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Chapters — add one or more for the reading page */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">
              Chapters (for reading)
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addChapter}>
              <span className="material-icons text-base mr-1">add</span>
              Add chapter
            </Button>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Chapters with content will be created. Leave title/content empty to skip.
          </p>
          <div className="space-y-6">
            {chapters.map((ch, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Chapter {ch.chapterNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChapter(i)}
                    className="text-neutral-400 hover:text-red-600 text-sm"
                    title="Remove chapter"
                  >
                    <span className="material-icons text-lg">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Chapter number"
                    type="number"
                    min={1}
                    value={ch.chapterNumber}
                    onChange={(e) =>
                      updateChapter(i, "chapterNumber", parseInt(e.target.value, 10) || 1)
                    }
                  />
                  <Input
                    label="Chapter ID"
                    value={ch.chapterId}
                    onChange={(e) => updateChapter(i, "chapterId", e.target.value)}
                    placeholder="chapter-1"
                  />
                </div>
                <Input
                  label="Title"
                  value={ch.title}
                  onChange={(e) => updateChapter(i, "title", e.target.value)}
                  placeholder="Chapter title"
                />
                <div>
                  <label className="block text-sm font-medium mb-1.5">Content</label>
                  <textarea
                    value={ch.content}
                    onChange={(e) => updateChapter(i, "content", e.target.value)}
                    rows={6}
                    placeholder="Chapter text (paragraphs separated by blank lines)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            Create Book
          </Button>
          <Link href="/admin/books">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
