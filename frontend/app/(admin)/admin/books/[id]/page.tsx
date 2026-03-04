"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

interface Book {
  _id: string;
  title: string;
  slug: string;
  author: string;
  authors?: string[];
  description?: string;
  coverImageUrl?: string;
  category?: string;
  language?: string;
  genres?: string[];
  pageCount?: number;
  estimatedReadTimeMinutes?: number;
  rating?: number;
  ratingCount?: number;
  status?: string;
}

interface Chapter {
  _id: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  content?: string;
}

export default function AdminBookEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterForm, setEditChapterForm] = useState({ title: "", content: "" });
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    chapterNumber: 1,
    chapterId: "chapter-1",
    title: "",
    content: "",
  });
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

  useEffect(() => {
    Promise.all([
      api.get<Book>(`/api/v1/books/${id}`),
      api.get<Chapter[]>(`/api/v1/chapters/book/${id}`),
    ])
      .then(([b, ch]) => {
        setBook(b);
        setChapters(Array.isArray(ch) ? ch : []);
        setForm({
          title: b.title,
          slug: b.slug,
          author: b.author,
          authors: (b.authors ?? []).join(", "),
          description: b.description ?? "",
          coverImageUrl: b.coverImageUrl ?? "",
          category: b.category ?? "fiction",
          language: b.language ?? "en",
          genres: (b.genres ?? []).join(", "),
          pageCount: b.pageCount?.toString() ?? "",
          estimatedReadTimeMinutes: b.estimatedReadTimeMinutes?.toString() ?? "",
          status: b.status ?? "published",
        });
      })
      .catch(() => setError("Failed to load book"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
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
      } else {
        payload.authors = [];
      }
      if (form.genres.trim()) {
        payload.genres = form.genres.split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        payload.genres = [];
      }
      if (form.pageCount) payload.pageCount = parseInt(form.pageCount, 10);
      if (form.estimatedReadTimeMinutes) {
        payload.estimatedReadTimeMinutes = parseInt(form.estimatedReadTimeMinutes, 10);
      }
      await api.put(`/api/v1/books/${id}`, payload);
      setBook((prev) => prev ? { ...prev, ...payload } as Book : prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this book? This cannot be undone.")) return;
    setSaving(true);
    try {
      await api.delete(`/api/v1/books/${id}`);
      router.push("/admin/books");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
      setSaving(false);
    }
  }

  async function refetchChapters() {
    const ch = await api.get<Chapter[]>(`/api/v1/chapters/book/${id}`);
    setChapters(Array.isArray(ch) ? ch : []);
  }

  function startEditChapter(ch: Chapter) {
    setEditingChapterId(ch._id);
    setEditChapterForm({ title: ch.title, content: ch.content ?? "" });
  }

  function cancelEditChapter() {
    setEditingChapterId(null);
    setEditChapterForm({ title: "", content: "" });
  }

  async function saveEditChapter() {
    if (!editingChapterId) return;
    setSaving(true);
    try {
      await api.put(`/api/v1/chapters/${editingChapterId}`, {
        title: editChapterForm.title,
        content: editChapterForm.content,
      });
      await refetchChapters();
      cancelEditChapter();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update chapter");
    } finally {
      setSaving(false);
    }
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm("Delete this chapter?")) return;
    setSaving(true);
    try {
      await api.delete(`/api/v1/chapters/${chapterId}`);
      await refetchChapters();
      if (editingChapterId === chapterId) cancelEditChapter();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete chapter");
    } finally {
      setSaving(false);
    }
  }

  function openAddChapter() {
    const nextNum = chapters.length
      ? Math.max(...chapters.map((c) => c.chapterNumber), 0) + 1
      : 1;
    setNewChapter({
      chapterNumber: nextNum,
      chapterId: `chapter-${nextNum}`,
      title: "",
      content: "",
    });
    setShowAddChapter(true);
  }

  async function submitNewChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!newChapter.title.trim() || !newChapter.content.trim()) return;
    setSaving(true);
    try {
      await api.post("/api/v1/chapters", {
        bookId: id,
        chapterNumber: newChapter.chapterNumber,
        chapterId: newChapter.chapterId,
        title: newChapter.title.trim(),
        content: newChapter.content.trim(),
      });
      await refetchChapters();
      setShowAddChapter(false);
      setNewChapter({ chapterNumber: 1, chapterId: "chapter-1", title: "", content: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add chapter");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600">
        {error}
      </div>
    );
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
          Edit Book
        </h2>
        {book && (
          <span className="ml-auto text-xs text-neutral-400">
            ID: {book._id}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Book form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Basic Information
            </h3>

            <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
            <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required helperText="URL-friendly identifier" />
            <Input label="Author" name="author" value={form.author} onChange={handleChange} required placeholder="Primary author" />
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
              placeholder="e.g. Literary Fiction, Parallel Universe"
              helperText="Shown as tags on book cards and detail page"
            />

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                Reading Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Page Count" name="pageCount" type="number" min="0" value={form.pageCount} onChange={handleChange} placeholder="e.g. 304" />
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

            {book?.rating !== undefined && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                  Rating (auto-computed from reviews)
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-icons text-xl">
                        {i <= (book.rating ?? 0) ? "star" : "star_border"}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {book.rating?.toFixed(1) ?? "0.0"} ({book.ratingCount ?? 0} reviews)
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>
                Delete Book
              </Button>
            </div>
          </form>
        </div>

        {/* Right column — Cover preview + Chapters */}
        <div className="space-y-6">
          {/* Cover preview */}
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

          {/* Chapters */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800 dark:text-white">
                Chapters ({chapters.length})
              </h3>
              <Button type="button" size="sm" onClick={openAddChapter} disabled={showAddChapter}>
                <span className="material-icons text-base mr-1">add</span>
                Add
              </Button>
            </div>

            {showAddChapter && (
              <form
                onSubmit={submitNewChapter}
                className="mb-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Number"
                    type="number"
                    min={1}
                    value={newChapter.chapterNumber}
                    onChange={(e) =>
                      setNewChapter((prev) => ({
                        ...prev,
                        chapterNumber: parseInt(e.target.value, 10) || 1,
                        chapterId: `chapter-${parseInt(e.target.value, 10) || 1}`,
                      }))
                    }
                  />
                  <Input
                    label="Chapter ID"
                    value={newChapter.chapterId}
                    onChange={(e) => setNewChapter((prev) => ({ ...prev, chapterId: e.target.value }))}
                  />
                </div>
                <Input
                  label="Title"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
                <MarkdownEditor
                  label="Content"
                  value={newChapter.content}
                  onChange={(v) => setNewChapter((prev) => ({ ...prev, content: v }))}
                  height={250}
                  placeholder="Write chapter content in Markdown..."
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" isLoading={saving} disabled={!newChapter.title.trim() || !newChapter.content.trim()}>
                    Create chapter
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddChapter(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {chapters.length === 0 && !showAddChapter ? (
              <p className="text-sm text-neutral-500">No chapters yet. Add one to enable the reading page.</p>
            ) : (
              <ul className="space-y-2">
                {chapters.map((ch) => (
                  <li
                    key={ch._id}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden"
                  >
                    {editingChapterId === ch._id ? (
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 space-y-3">
                        <Input
                          label="Title"
                          value={editChapterForm.title}
                          onChange={(e) => setEditChapterForm((p) => ({ ...p, title: e.target.value }))}
                        />
                        <MarkdownEditor
                          label="Content"
                          value={editChapterForm.content}
                          onChange={(v) => setEditChapterForm((p) => ({ ...p, content: v }))}
                          height={300}
                          placeholder="Edit chapter content..."
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={saveEditChapter} isLoading={saving}>
                            Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEditChapter}>
                            Cancel
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => deleteChapter(ch._id)} disabled={saving}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {ch.chapterNumber}. {ch.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditChapter(ch)}
                            className="text-primary text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteChapter(ch._id)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
