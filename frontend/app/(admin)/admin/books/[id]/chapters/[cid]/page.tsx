"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

interface Chapter {
  _id: string;
  bookId: string;
  chapterNumber: number;
  chapterId: string;
  title: string;
  content: string;
}

export default function AdminEditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const cid = params.cid as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ chapterNumber: "", chapterId: "", title: "", content: "" });

  useEffect(() => {
    api
      .get<Chapter>(`/api/v1/chapters/${cid}`)
      .then((ch) => {
        setForm({
          chapterNumber: String(ch.chapterNumber),
          chapterId: ch.chapterId,
          title: ch.title,
          content: ch.content,
        });
      })
      .catch(() => setError("Failed to load chapter"))
      .finally(() => setLoading(false));
  }, [cid]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put(`/api/v1/chapters/${cid}`, {
        chapterNumber: parseInt(form.chapterNumber, 10),
        chapterId: form.chapterId,
        title: form.title,
        content: form.content,
      });
      router.push(`/admin/books/${bookId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this chapter?")) return;
    setSaving(true);
    try {
      await api.delete(`/api/v1/chapters/${cid}`);
      router.push(`/admin/books/${bookId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/books/${bookId}`}
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
        >
          <span className="material-icons">arrow_back</span>
        </Link>
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
          Edit Chapter
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
        <div className="grid grid-cols-2 gap-4">
          <Input label="Chapter Number" name="chapterNumber" type="number" min="1" value={form.chapterNumber} onChange={handleChange} required />
          <Input label="Chapter ID" name="chapterId" value={form.chapterId} onChange={handleChange} required />
        </div>
        <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
        <div>
          <label className="block text-sm font-medium mb-1.5">Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={16}
            required
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm font-mono"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>
            Delete Chapter
          </Button>
        </div>
      </form>
    </div>
  );
}
