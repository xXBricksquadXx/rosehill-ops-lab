// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Rosehill Ops Lab",
  description: "Profession profiles backed by FastAPI + MongoDB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-brand-bg text-brand-text`}
      >
        <div className="min-h-screen bg-brand-bg text-brand-text">
          <header className="border-b border-brand-accent/20 bg-black/20">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/rosehillops-logo.png"
                  alt="Rosehill Ops logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-sm font-semibold tracking-tight">
                  Rosehill Ops Lab
                </span>
              </Link>

              <nav className="flex items-center gap-3 text-sm">
                <Link
                  href="/"
                  className="rounded-full border border-transparent px-3 py-1 text-brand-muted hover:border-brand-accent hover:text-brand-accent"
                >
                  Profiles
                </Link>
                <Link
                  href="/work-items"
                  className="rounded-full border border-transparent px-3 py-1 text-brand-muted hover:border-brand-accent hover:text-brand-accent"
                >
                  Work board
                </Link>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-brand-accent/40 px-3 py-1 text-xs text-brand-accent hover:bg-brand-accent hover:text-brand-bg"
                >
                  API docs
                </a>
              </nav>
            </div>
          </header>

          {children}
        </div>
      </body>
    </html>
  );
}
