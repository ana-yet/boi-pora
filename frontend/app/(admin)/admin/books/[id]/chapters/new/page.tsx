"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

export default function AdminNewChapterPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    chapterNumber: "1",
    chapterId: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    api
      .get<Array<{ chapterNumber: number }>>(`/api/v1/chapters/book/${bookId}`)
      .then((chapters) => {
        const arr = Array.isArray(chapters) ? chapters : [];
        const max = arr.reduce((m, c) => Math.max(m, c.chapterNumber ?? 0), 0);
        setForm((f) => ({ ...f, chapterNumber: String(max + 1), chapterId: `chapter-${max + 1}` }));
      })
      .catch(() => {});
  }, [bookId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "chapterNumber") {
      setForm((prev) => ({ ...prev, chapterId: `chapter-${value}` }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ _id: string }>("/api/v1/chapters", {
        bookId,
        chapterNumber: parseInt(form.chapterNumber, 10),
        chapterId: form.chapterId,
        title: form.title,
        content: form.content,
      });
      router.push(`/admin/books/${bookId}/chapters/${res._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create chapter");
    } finally {
      setLoading(false);
    }
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
          Add Chapter
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
          <Input
            label="Chapter Number"
            name="chapterNumber"
            type="number"
            min="1"
            value={form.chapterNumber}
            onChange={handleChange}
            required
          />
          <Input
            label="Chapter ID"
            name="chapterId"
            value={form.chapterId}
            onChange={handleChange}
            required
            helperText="e.g. chapter-1"
          />
        </div>
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
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
          <Button type="submit" isLoading={loading}>
            Create Chapter
          </Button>
          <Link href={`/admin/books/${bookId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
