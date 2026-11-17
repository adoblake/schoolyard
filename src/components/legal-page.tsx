import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SchoolYard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Draft for review. This document hasn&apos;t been reviewed by a lawyer yet and will be updated before launch.
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">Last updated {updated}</p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-950 [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
