import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Wordmark } from "@/components/cl";
import { REGIONS } from "@/lib/data";
import { TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "SchoolYard: student classifieds by campus",
  description: TAGLINE,
};

/** Sites page: every SchoolYard city, grouped by state, plus how to get yours added. */
export default function Home() {
  return (
    <div className="px-3">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-2 border-b border-rule pb-3 pt-5">
          <div>
            <Wordmark size="lg" />
            <p className="mt-1 text-zinc-600">{TAGLINE}</p>
          </div>
          <nav className="flex gap-3 text-[13px]">
            <Link href="/about">about</Link>
            <Link href="/schools">for schools</Link>
            <Link href="/login">log in</Link>
          </nav>
        </header>

        <div className="mt-5 grid gap-8 md:grid-cols-[1fr_260px]">
          <main>
            <h1 className="bar text-[15px]">SchoolYard sites</h1>
            <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <section>
                <h2 className="mb-1 font-bold">Arizona</h2>
                <ul className="space-y-1">
                  {REGIONS.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/${r.slug}`} className="text-[15px]">
                        {r.slug}
                      </Link>
                      <div className="text-[12px] text-zinc-500">{r.schools.map((s) => s.name).join(", ")}</div>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="mb-1 font-bold">Coming next</h2>
                <p className="text-zinc-600">
                  New campuses open where students ask for them.{" "}
                  <Link href="/about#request">Request your campus</Link>.
                </p>
              </section>
            </div>
          </main>

          <aside className="space-y-4 text-[13px]">
            <div>
              <h2 className="bar">how it works</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-zinc-700">
                <li>Log in with your school email.</li>
                <li>Post what you&apos;re selling, giving away or looking for.</li>
                <li>Meet on campus to trade.</li>
              </ol>
              <p className="mt-2">
                <Link href="/about">more about SchoolYard</Link>
              </p>
            </div>
            <div>
              <h2 className="bar">free to post</h2>
              <p className="mt-2 text-zinc-700">No listing fees and no cut of your sale. Only verified students can post.</p>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </div>
  );
}
