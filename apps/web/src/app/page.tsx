type Profile = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
};

async function getProfiles(): Promise<Profile[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  const res = await fetch(`${baseUrl}/profiles`, {
    // Always hit the API (no build-time caching)
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profiles: ${res.status}`);
  }

  return res.json();
}

export default async function HomePage() {
  const profiles = await getProfiles();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Rosehill Ops Lab
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Profession profiles backed by FastAPI + MongoDB.
            </p>
          </div>

          <span className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            API: <span className="ml-1 font-mono">GET /profiles</span>
          </span>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm"
            >
              <h2 className="text-lg font-medium">{p.label}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                {p.key}
              </p>
              <p className="mt-3 text-sm text-slate-300">{p.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
