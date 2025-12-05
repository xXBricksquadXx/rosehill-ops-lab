// apps/web/src/app/work-items/work-board-client.tsx
"use client";

import { useMemo, useState } from "react";

import type { WorkItem } from "./page";

type Profile = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
};

type WorkStatus = "backlog" | "in_progress" | "done";
type WorkPriority = "low" | "medium" | "high" | "urgent";

const STATUS_OPTIONS: { value: WorkStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: WorkPriority | "all"; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function pillClass(active: boolean) {
  return [
    "inline-flex items-center rounded-full border px-3 py-1 text-xs",
    active
      ? "border-brand-accent bg-brand-accent text-brand-bg"
      : "border-brand-accent/40 text-brand-muted hover:border-brand-accent hover:text-brand-accent",
  ].join(" ");
}

export default function WorkBoardClient({
  profiles,
  workItems,
}: {
  profiles: Profile[];
  workItems: WorkItem[];
}) {
  const [statusFilter, setStatusFilter] = useState<WorkStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] =
    useState<WorkPriority | "all">("all");

  const filtered = useMemo(
    () =>
      workItems.filter((item) => {
        const okStatus =
          statusFilter === "all" || item.status === statusFilter;
        const okPriority =
          priorityFilter === "all" || item.priority === priorityFilter;
        return okStatus && okPriority;
      }),
    [workItems, statusFilter, priorityFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, WorkItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.profile_key) ?? [];
      arr.push(item);
      map.set(item.profile_key, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-accent/20 bg-black/10 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-brand-muted">Status:</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={pillClass(statusFilter === opt.value)}
                onClick={() =>
                  setStatusFilter(opt.value as WorkStatus | "all")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-5 w-px bg-brand-accent/20" />

        <div className="flex items-center gap-2">
          <span className="text-brand-muted">Priority:</span>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={pillClass(priorityFilter === opt.value)}
                onClick={() =>
                  setPriorityFilter(opt.value as WorkPriority | "all")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Columns grouped by profile */}
      <div className="space-y-6">
        {profiles.map((profile) => {
          const items = grouped.get(profile.key) ?? [];

          return (
            <section
              key={profile.id}
              className="rounded-2xl border border-brand-accent/40 bg-brand-surface/95 p-4 shadow-md shadow-black/50"
            >
              <header className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-muted">
                    {profile.key.toUpperCase()}
                  </p>
                  <h2 className="text-lg font-medium">{profile.label}</h2>
                </div>
                <span className="text-[11px] text-brand-muted">
                  API:{" "}
                  <span className="font-mono">
                    GET /work-items?profile_key={profile.key}
                  </span>
                </span>
              </header>

              {items.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  No work items matching filters.
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
                          <span className="rounded-full border border-brand-accent/40 px-2 py-0.5 text-brand-accent">
                            {item.priority}
                          </span>
                          <span className="rounded-full border border-brand-muted/40 px-2 py-0.5 text-brand-muted">
                            {item.status}
                          </span>
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
          );
        })}
      </div>
    </div>
  );
}
