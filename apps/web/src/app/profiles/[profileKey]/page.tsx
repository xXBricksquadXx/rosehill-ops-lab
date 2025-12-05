// apps/web/src/app/profiles/[profileKey]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

type Profile = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
};

type WorkItem = {
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
  if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
  return res.json();
}

async function getWorkItems(profileKey: string): Promise<WorkItem[]> {
  const res = await fetch(
    `${API_BASE}/work-items?profile_key=${encodeURIComponent(profileKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch work items: ${res.status}`);
  return res.json();
}

export default async function ProfilePage({
  params,
}: {
  // NOTE: params is a Promise in Next 16
  params: Promise<{ profileKey: string }>;
}) {
  // unwrap the Promise before using profileKey
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

          {workItems.length === 0 ? (
            <p className="text-sm text-brand-muted">
              No work items yet for this profile.
            </p>
          ) : (
            <div className="space-y-3">
              {workItems.map((item) => (
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
      </div>
    </main>
  );
}
