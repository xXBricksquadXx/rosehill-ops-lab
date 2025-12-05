// apps/web/src/app/work-items/page.tsx
import Link from "next/link";

import WorkBoardClient from "./work-board-client";

type Profile = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
};

export type WorkItem = {
  id: string;
  profile_key: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string | null;
  notes?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";

export default async function WorkItemsPage() {
  const [profilesRes, workItemsRes] = await Promise.all([
    fetch(`${API_BASE}/profiles`, { cache: "no-store" }),
    fetch(`${API_BASE}/work-items`, { cache: "no-store" }),
  ]);

  if (!profilesRes.ok || !workItemsRes.ok) {
    throw new Error("Failed to fetch board data");
  }

  const [profiles, workItems] = (await Promise.all([
    profilesRes.json(),
    workItemsRes.json(),
  ])) as [Profile[], WorkItem[]];

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-muted">
              Board
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Work items across profiles
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-brand-accent px-3 py-1 text-xs text-brand-accent hover:bg-brand-accent hover:text-brand-bg"
          >
            ← Back to profiles
          </Link>
        </div>

        <WorkBoardClient profiles={profiles} workItems={workItems} />
      </div>
    </main>
  );
}
