"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

export default function AdminEditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", role: "user", password: "" });

  useEffect(() => {
    api
      .get<{ _id: string; email: string; name?: string; role: string }>(`/api/v1/admin/users/${id}`)
      .then((u) => setForm({ email: u.email, name: u.name ?? "", role: u.role, password: "" }))
      .catch(() => setError("Failed to load user"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, string> = { email: form.email, name: form.name, role: form.role };
      if (form.password) payload.password = form.password;
      await api.put(`/api/v1/admin/users/${id}`, payload);
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this user?")) return;
    setSaving(true);
    try {
      await api.delete(`/api/v1/admin/users/${id}`);
      router.push("/admin/users");
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
        <Link href="/admin/users" className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white">
          <span className="material-icons">arrow_back</span>
        </Link>
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Edit User</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6"
      >
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
        )}
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <Input label="Name" name="name" value={form.name} onChange={handleChange} />
        <Input label="New Password (leave blank to keep)" name="password" type="password" value={form.password} onChange={handleChange} />
        <div>
          <label className="block text-sm font-medium mb-1.5">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={saving}>Save</Button>
          <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>Delete</Button>
        </div>
      </form>
    </div>
  );
}
