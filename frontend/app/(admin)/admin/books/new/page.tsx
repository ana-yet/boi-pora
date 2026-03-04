"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { LANGUAGES, getLanguageLabel } from "@/lib/constants";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { MarkdownEditor } from "@/app/components/ui/MarkdownEditor";

const CATEGORIES = [
  { value: "fiction", label: "Fiction" },
  { value: "nonfiction", label: "Nonfiction" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "fantasy", label: "Fantasy" },
  { value: "romance", label: "Romance" },
  { value: "mystery", label: "Mystery" },
  { value: "horror", label: "Horror" },
  { value: "academic", label: "Academic" },
  { value: "self-help", label: "Self Help" },
  { value: "history", label: "History" },
  { value: "business", label: "Business" },
  { value: "philosophy", label: "Philosophy" },
  { value: "biography", label: "Biography" },
  { value: "poetry", label: "Poetry" },
  { value: "children", label: "Children" },
  { value: "other", label: "Other" },
] as const;

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a3a3a3' font-size='14'%3ENo Cover%3C/text%3E%3C/svg%3E";

const selectClass =
  "w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500";

const textareaClass =
  "w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500";

export interface ChapterDraft {
  chapterNumber: number;
  chapterId: string;
  title: string;
  content: string;
}

function newChapterDraft(n: number): ChapterDraft {
  return { chapterNumber: n, chapterId: `chapter-${n}`, title: "", content: "" };
}

export default function AdminNewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    author: "",
    authors: "",
    description: "",
    coverImageUrl: "",
    category: "fiction",
    language: "en",
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
        language: form.language,
        status: form.status,
      };
      if (form.authors.trim()) {
        payload.authors = form.authors.split(",").map((s) => s.trim()).filter(Boolean);
      }
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Book details */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Basic Information
          </h3>

          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. The Midnight Library"
          />
          <Input
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            helperText="URL-friendly identifier, auto-generated from title"
          />
          <Input
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
            required
            placeholder="Primary author name"
          />
          <Input
            label="Co-authors (comma-separated)"
            name="authors"
            value={form.authors}
            onChange={handleChange}
            placeholder="e.g. John Doe, Jane Smith"
            helperText="Leave empty for single-author books"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="A brief synopsis shown on the book detail page..."
              className={textareaClass}
            />
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={selectClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <Input
            label="Genres (comma-separated)"
            name="genres"
            value={form.genres}
            onChange={handleChange}
            placeholder="e.g. Literary Fiction, Parallel Universe, Life Choices"
            helperText="Shown as tags on book cards and detail page"
          />

          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Reading Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Page Count"
                name="pageCount"
                type="number"
                min="0"
                value={form.pageCount}
                onChange={handleChange}
                placeholder="e.g. 304"
              />
              <Input
                label="Estimated Read Time (minutes)"
                name="estimatedReadTimeMinutes"
                type="number"
                min="0"
                value={form.estimatedReadTimeMinutes}
                onChange={handleChange}
                placeholder="e.g. 240"
                helperText="Shown as duration on cards"
              />
            </div>
          </div>

          {/* Chapters */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Chapters
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addChapter}>
                <span className="material-icons text-base mr-1">add</span>
                Add chapter
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Only chapters with content will be created. These power the reading page.
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
                    {chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChapter(i)}
                        className="text-neutral-400 hover:text-red-600 text-sm"
                        title="Remove chapter"
                      >
                        <span className="material-icons text-lg">close</span>
                      </button>
                    )}
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
                  <MarkdownEditor
                    label="Content"
                    value={ch.content}
                    onChange={(v) => updateChapter(i, "content", v)}
                    height={250}
                    placeholder="Write chapter content in Markdown..."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={loading}>
              Create Book
            </Button>
            <Link href="/admin/books">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Right column — Cover preview + summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Cover Preview</h3>
            <div className="aspect-2/3 w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 shadow-md">
              <img
                alt="Cover preview"
                src={form.coverImageUrl || PLACEHOLDER}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Cover Image URL"
                name="coverImageUrl"
                value={form.coverImageUrl}
                onChange={handleChange}
                type="url"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Summary</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Title</dt>
                <dd className="font-medium text-neutral-800 dark:text-white truncate ml-4 max-w-[160px]">
                  {form.title || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Author</dt>
                <dd className="font-medium text-neutral-800 dark:text-white truncate ml-4 max-w-[160px]">
                  {form.author || "—"}
                </dd>
              </div>
              {form.authors.trim() && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Co-authors</dt>
                  <dd className="font-medium text-neutral-800 dark:text-white truncate ml-4 max-w-[160px]">
                    {form.authors}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Category</dt>
                <dd className="font-medium text-neutral-800 dark:text-white">
                  {CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Language</dt>
                <dd className="font-medium text-neutral-800 dark:text-white">
                  {getLanguageLabel(form.language)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Status</dt>
                <dd>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    form.status === "published" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}>
                    {form.status}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Pages</dt>
                <dd className="font-medium text-neutral-800 dark:text-white">
                  {form.pageCount || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Read time</dt>
                <dd className="font-medium text-neutral-800 dark:text-white">
                  {form.estimatedReadTimeMinutes ? `${form.estimatedReadTimeMinutes} min` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">Chapters</dt>
                <dd className="font-medium text-neutral-800 dark:text-white">
                  {chapters.filter((ch) => ch.content.trim()).length} with content
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </form>
    </div>
  );
}
