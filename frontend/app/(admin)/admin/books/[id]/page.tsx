"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='72'%3E%3Crect fill='%23e5e7eb' width='48' height='72'/%3E%3C/svg%3E";

interface Book {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  genres?: string[];
  pageCount?: number;
  estimatedReadTimeMinutes?: number;
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
    description: "",
    coverImageUrl: "",
    category: "fiction",
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
          description: b.description ?? "",
          coverImageUrl: b.coverImageUrl ?? "",
          category: b.category ?? "fiction",
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
        status: form.status,
      };
      if (form.genres.trim()) {
        payload.genres = form.genres.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (form.pageCount) payload.pageCount = parseInt(form.pageCount, 10);
      if (form.estimatedReadTimeMinutes) {
        payload.estimatedReadTimeMinutes = parseInt(form.estimatedReadTimeMinutes, 10);
      }
      await api.put(`/api/v1/books/${id}`, payload);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
            <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} required />
            <Input label="Author" name="author" value={form.author} onChange={handleChange} required />
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
            <Input label="Cover Image URL" name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} />
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
            <Input label="Genres (comma-separated)" name="genres" value={form.genres} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Page Count" name="pageCount" type="number" min="0" value={form.pageCount} onChange={handleChange} />
              <Input label="Read Time (minutes)" name="estimatedReadTimeMinutes" type="number" min="0" value={form.estimatedReadTimeMinutes} onChange={handleChange} />
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
            <div className="flex gap-3">
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>
                Delete Book
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800 dark:text-white">Chapters (for reading)</h3>
              <Button
                type="button"
                size="sm"
                onClick={openAddChapter}
                disabled={showAddChapter}
              >
                <span className="material-icons text-base mr-1">add</span>
                Add chapter
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
                <div>
                  <label className="block text-sm font-medium mb-1.5">Content</label>
                  <textarea
                    value={newChapter.content}
                    onChange={(e) => setNewChapter((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" isLoading={saving} disabled={!newChapter.title.trim() || !newChapter.content.trim()}>
                    Create chapter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddChapter(false)}
                  >
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
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Content</label>
                          <textarea
                            value={editChapterForm.content}
                            onChange={(e) => setEditChapterForm((p) => ({ ...p, content: e.target.value }))}
                            rows={8}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={saveEditChapter} isLoading={saving}>
                            Save
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEditChapter}>
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => deleteChapter(ch._id)}
                            disabled={saving}
                          >
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
