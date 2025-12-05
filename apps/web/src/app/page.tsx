import Image from "next/image";

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
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 md:h-14 md:w-14">
              <Image
                src="/rosehillops-logo.png"
                alt="Rosehill Ops logo"
                fill
                className="rounded-xl object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Rosehill Ops Lab
              </h1>
              <p className="mt-1 text-sm text-brand-muted">
                Profession profiles backed by FastAPI + MongoDB.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center rounded-full border border-brand-accent/60 px-3 py-1 text-xs text-brand-accent">
            API: <span className="ml-1 font-mono">GET /profiles</span>
          </span>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-brand-accent/30 bg-brand-surface/95 p-4 shadow-md shadow-black/50"
            >
              <h2 className="text-lg font-medium">{p.label}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-brand-muted">
                {p.key}
              </p>
              <p className="mt-3 text-sm text-brand-text/90">
                {p.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
