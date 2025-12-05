// apps/web/src/app/profiles/[profileKey]/page.tsx
import { notFound } from "next/navigation";

import ProfilePageClient from "./profile-page-client";

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

async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${API_BASE}/profiles`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profiles");
  return res.json();
}

async function getWorkItems(profileKey: string): Promise<WorkItem[]> {
  const res = await fetch(
    `${API_BASE}/work-items?profile_key=${encodeURIComponent(profileKey)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch work items");
  return res.json();
}

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileKey: string }>;
}) {
  const { profileKey } = await params;

  const [profiles, workItems] = await Promise.all([
    getProfiles(),
    getWorkItems(profileKey),
  ]);

  const profile = profiles.find((p) => p.key === profileKey);
  if (!profile) notFound();

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <ProfilePageClient profile={profile} initialWorkItems={workItems} />
      </div>
    </main>
  );
}
