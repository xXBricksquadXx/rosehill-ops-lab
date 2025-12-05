// apps/web/src/app/profiles/[profileKey]/profile-page-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import type { WorkItem } from "./page";

type Profile = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
};

type WorkStatus = "backlog" | "in_progress" | "done";
type WorkPriority = "low" | "medium" | "high" | "urgent";

const STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: WorkPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function ProfilePageClient({
  profile,
  initialWorkItems,
}: {
  profile: Profile;
  initialWorkItems: WorkItem[];
}) {
  const [items, setItems] = useState<WorkItem[]>(initialWorkItems);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    status: "backlog" as WorkStatus,
    priority: "medium" as WorkPriority,
    assignee: "",
    notes: "",
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/work-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_key: profile.key,
          title: form.title.trim(),
          status: form.status,
          priority: form.priority,
          assignee: form.assignee || null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("Failed to create work item");
        return;
      }

      const created = (await res.json()) as WorkItem;
      setItems((prev) => [created, ...prev]);
      setForm({
        title: "",
        status: "backlog",
        priority: "medium",
        assignee: "",
        notes: "",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(
    id: string,
    updates: Partial<Pick<WorkItem, "status" | "priority">>,
  ) {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;

    const optimistic = items.map((i) =>
      i.id === id ? { ...i, ...updates } : i,
    );
    setItems(optimistic);

    try {
      const res = await fetch(`${API_BASE}/work-items/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...existing, ...updates }),
      });

      if (!res.ok) {
        console.error(await res.text());
        alert("Failed to update work item");
      } else {
        const updated = (await res.json()) as WorkItem;
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update work item");
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-muted">
            Profile
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.label}
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            {profile.description}
          </p>
        </div>

        <Link
          href="/"
          className="rounded-full border border-brand-accent px-3 py-1 text-xs text-brand-accent hover:bg-brand-accent hover:text-brand-bg"
        >
          ← Back to profiles
        </Link>
      </div>

      <section className="rounded-2xl border border-brand-accent/40 bg-brand-surface/95 p-4 shadow-md shadow-black/50">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Work items</h2>
          <span className="text-xs text-brand-muted">
            API:{" "}
            <span className="font-mono">
              GET /work-items?profile_key={profile.key}
            </span>
          </span>
        </header>

        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="mb-4 rounded-xl border border-brand-accent/30 bg-black/20 p-3 text-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-wide text-brand-muted">
                Title
              </label>
              <input
                className="mt-1 w-full rounded-md border border-brand-accent/40 bg-black/40 px-2 py-1 text-sm outline-none focus:border-brand-accent"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Set up diagnostic bench for board-level repairs"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-brand-muted">
                Status
              </label>
              <select
                className="mt-1 w-full rounded-md border border-brand-accent/40 bg-black/40 px-2 py-1 text-xs"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as WorkStatus,
                  }))
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-brand-muted">
                Priority
              </label>
              <select
                className="mt-1 w-full rounded-md border border-brand-accent/40 bg-black/40 px-2 py-1 text-xs"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as WorkPriority,
                  }))
                }
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <div>
              <label className="block text-xs uppercase tracking-wide text-brand-muted">
                Assignee
              </label>
              <input
                className="mt-1 w-full rounded-md border border-brand-accent/40 bg-black/40 px-2 py-1 text-sm outline-none focus:border-brand-accent"
                value={form.assignee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs uppercase tracking-wide text-brand-muted">
                Notes
              </label>
              <input
                className="mt-1 w-full rounded-md border border-brand-accent/40 bg-black/40 px-2 py-1 text-sm outline-none focus:border-brand-accent"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Optional context"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-md bg-brand-accent px-4 py-2 text-xs font-medium text-brand-bg hover:bg-brand-accent/90 disabled:opacity-60"
              >
                {creating ? "Saving…" : "Add item"}
              </button>
            </div>
          </div>
        </form>

        {/* Existing items with inline status/priority edit */}
        {items.length === 0 ? (
          <p className="text-sm text-brand-muted">
            No work items yet for this profile.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-brand-accent/20 bg-black/10 p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <div className="flex gap-2 text-[11px] uppercase tracking-wide">
                    <select
                      className="rounded-full border border-brand-accent/40 bg-black/30 px-2 py-0.5 text-xs"
                      value={item.priority}
                      onChange={(e) =>
                        handleUpdate(item.id, {
                          priority: e.target.value as WorkPriority,
                        })
                      }
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-full border border-brand-muted/40 bg-black/30 px-2 py-0.5 text-xs"
                      value={item.status}
                      onChange={(e) =>
                        handleUpdate(item.id, {
                          status: e.target.value as WorkStatus,
                        })
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-1 text-xs text-brand-muted">
                  Assignee:{" "}
                  <span className="text-brand-text">
                    {item.assignee || "Unassigned"}
                  </span>
                </div>

                {item.notes && (
                  <p className="mt-2 text-sm text-brand-text/90">
                    {item.notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
