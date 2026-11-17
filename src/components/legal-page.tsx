import { Footer, TopBar } from "@/components/cl";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div>
      <TopBar crumbs={[{ label: title.toLowerCase() }]} />
      <main className="mx-auto max-w-3xl px-3 py-5">
        <p className="mb-4 border border-amber-400 bg-amber-50 p-2 text-[13px] text-amber-900">
          Draft for review. This document hasn&apos;t been reviewed by a lawyer yet and will be updated before launch.
        </p>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-[13px] text-zinc-500">last updated {updated}</p>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed [&_h2]:mt-6 [&_h2]:border [&_h2]:border-rule [&_h2]:bg-bar [&_h2]:px-2 [&_h2]:py-0.5 [&_h2]:text-[14px] [&_h2]:font-bold [&_li]:ml-6 [&_li]:list-disc">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
