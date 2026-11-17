import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Wordmark } from "@/components/cl";
import { CATEGORY_LABELS, SECTIONS } from "@/lib/categories";
import { REGIONS, getRegion } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/[region]">): Promise<Metadata> {
  const { region } = await params;
  const r = getRegion(region);
  return r ? { title: `${r.label}: ${r.subtitle}`, description: r.subtitle } : {};
}

/** City home: Craigslist-style directory of sections and categories. */
export default async function RegionHome({ params }: PageProps<"/[region]">) {
  const { region: slug } = await params;
  const region = getRegion(slug)!;
  const search = `/${slug}/search`;

  return (
    <div className="px-3">
      <div className="mx-auto grid max-w-6xl gap-x-6 gap-y-5 pt-4 md:grid-cols-[180px_1fr_170px] md:grid-rows-[auto_1fr]">
        {/* Left column, top: logo, post, account, search. (On phones this comes first, then the directory.) */}
        <aside className="space-y-3 text-[13px] md:col-start-1 md:row-start-1">
          <Wordmark href="/" size="lg" />
          <div className="space-y-1">
            <Link href={`/${slug}/post`} className="block text-[15px] font-bold">
              create a posting
            </Link>
            <Link href={`/account?region=${slug}`} className="block">
              my account
            </Link>
            <Link href={`/${slug}/saved`} className="block">
              favorites
            </Link>
          </div>
          <form action={search} role="search">
            <label htmlFor="home-search" className="sr-only">
              search {region.label}
            </label>
            <input id="home-search" name="query" type="search" placeholder={`search ${region.slug}`} className="w-full" />
          </form>
        </aside>

        {/* Center: the directory */}
        <main className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
          <h1 className="mb-3 text-center text-[17px]">
            <span className="font-bold">{region.label}</span>{" "}
            <span className="text-zinc-500">· {region.subtitle}</span>
          </h1>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <section key={section.id} className={section.id === "forsale" ? "sm:row-span-3" : ""}>
                <h2 className="bar text-center">
                  <Link href={`${search}?section=${section.id}`}>{section.label}</Link>
                </h2>
                <ul
                  className={`mt-1.5 grid gap-x-4 gap-y-0.5 text-[14px] ${
                    section.categories.length > 4 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {section.categories.map((cat) => (
                    <li key={cat}>
                      <Link href={`${search}?cat=${encodeURIComponent(cat)}`}>{CATEGORY_LABELS[cat]}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </main>

        {/* Left column, bottom: campuses and help links */}
        <aside className="space-y-3 text-[13px] md:col-start-1 md:row-start-2">
          <div>
            <h2 className="bar text-[12px]">campuses</h2>
            <ul className="mt-1 space-y-0.5">
              {region.schools.map((s) => (
                <li key={s.id}>
                  <Link href={`${search}?school=${s.id}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-0.5">
            <Link href="/about" className="block">
              about SchoolYard
            </Link>
            <Link href="/about#safety" className="block">
              safety tips
            </Link>
            <Link href="/terms#prohibited" className="block">
              prohibited items
            </Link>
            <Link href="/terms" className="block">
              terms of use
            </Link>
            <Link href="/privacy" className="block">
              privacy policy
            </Link>
            <Link href="/schools" className="block">
              for schools
            </Link>
          </div>
        </aside>

        {/* Right column: other cities */}
        <aside className="space-y-3 text-[13px] md:col-start-3 md:row-span-2 md:row-start-1">
          <div>
            <h2 className="bar text-[12px]">SchoolYard sites</h2>
            <ul className="mt-1 space-y-0.5">
              {REGIONS.map((r) =>
                r.slug === slug ? (
                  <li key={r.slug} className="font-bold">
                    {r.slug}
                  </li>
                ) : (
                  <li key={r.slug}>
                    <Link href={`/${r.slug}`}>{r.slug}</Link>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h2 className="bar text-[12px]">your campus?</h2>
            <p className="mt-1 text-zinc-600">
              Not listed? <Link href="/about#request">Request it</Link>.
            </p>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
