import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Footer, TopBar, type Crumb } from "@/components/cl";
import { ResultGallery, ResultList } from "@/components/results";
import { CATEGORY_LABELS, SECTIONS, getSection, sectionOf } from "@/lib/categories";
import { getRegion } from "@/lib/data";
import { formatPrice, paramSource, parseFilters, searchHref } from "@/lib/listings";
import { PAGE_SIZE, searchListings } from "@/lib/queries";
import type { ListingFilters, Region } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[region]/search">): Promise<Metadata> {
  const { region } = await params;
  const r = getRegion(region);
  return r ? { title: `${r.label} search` } : {};
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[region]/search">) {
  const { region: slug } = await params;
  return (
    <Suspense fallback={<TopBar regionSlug={slug} crumbs={[{ label: slug, href: `/${slug}` }]} />}>
      <Search regionSlug={slug} searchParams={searchParams} />
    </Suspense>
  );
}

function crumbsFor(region: Region, f: ListingFilters): Crumb[] {
  const crumbs: Crumb[] = [{ label: region.slug, href: `/${region.slug}` }];
  const section = f.category !== "all" ? sectionOf(f.category) : getSection(f.section);
  if (section) crumbs.push({ label: section.label, href: `/${region.slug}/search?section=${section.id}` });
  if (f.category !== "all") crumbs.push({ label: CATEGORY_LABELS[f.category] });
  if (!section) crumbs.push({ label: "search" });
  return crumbs;
}

async function Search({
  regionSlug,
  searchParams,
}: {
  regionSlug: string;
  searchParams: PageProps<"/[region]/search">["searchParams"];
}) {
  const region = getRegion(regionSlug)!;
  const f = parseFilters(region, paramSource(await searchParams));
  const { listings, total, error } = await searchListings(f);
  const first = total === 0 ? 0 : (f.page - 1) * PAGE_SIZE + 1;
  const last = (f.page - 1) * PAGE_SIZE + listings.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <TopBar regionSlug={regionSlug} crumbs={crumbsFor(region, f)} />
      <div className="mx-auto grid max-w-6xl gap-4 px-3 pt-3 md:grid-cols-[220px_1fr]">
        <Filters region={region} f={f} />

        <main className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-2 text-[13px]">
            <div className="flex gap-3">
              <span className="text-zinc-500">view:</span>
              {(["list", "gallery"] as const).map((v) =>
                f.view === v ? (
                  <strong key={v}>{v}</strong>
                ) : (
                  <Link key={v} href={searchHref(f, { view: v, page: 1 })}>
                    {v}
                  </Link>
                ),
              )}
            </div>
            <div className="flex gap-3">
              <span className="text-zinc-500">sort:</span>
              {(
                [
                  ["newest", "newest"],
                  ["price-asc", "price ↑"],
                  ["price-desc", "price ↓"],
                ] as const
              ).map(([v, label]) =>
                f.sort === v ? (
                  <strong key={v}>{label}</strong>
                ) : (
                  <Link key={v} href={searchHref(f, { sort: v, page: 1 })}>
                    {label}
                  </Link>
                ),
              )}
            </div>
            <span className="text-zinc-600" aria-live="polite">
              {total === 0 ? "no results" : `${first} - ${last} of ${total}`}
            </span>
          </div>

          <div className="mt-3">
            {error ? (
              <p className="border border-red-300 bg-red-50 p-3 text-red-800" role="alert">
                {error}
              </p>
            ) : listings.length === 0 ? (
              <NoResults region={region} f={f} />
            ) : f.view === "gallery" ? (
              <ResultGallery listings={listings} />
            ) : (
              <ResultList listings={listings} />
            )}
          </div>

          {pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center justify-center gap-4 text-[14px]">
              {f.page > 1 ? <Link href={searchHref(f, { page: f.page - 1 })}>« prev</Link> : <span className="text-zinc-400">« prev</span>}
              <span>
                page {f.page} of {pages}
              </span>
              {f.page < pages ? <Link href={searchHref(f, { page: f.page + 1 })}>next »</Link> : <span className="text-zinc-400">next »</span>}
            </nav>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

function NoResults({ region, f }: { region: Region; f: ListingFilters }) {
  const narrowed =
    f.schoolId !== "all" || !!f.query || f.minPriceCents !== undefined || f.maxPriceCents !== undefined || f.hasImage || f.postedToday;
  return (
    <div className="border border-rule bg-bar/40 p-4">
      <p>Nothing here yet.</p>
      <p className="mt-2">
        {narrowed && (
          <>
            <Link href={searchHref({ ...f, schoolId: "all", query: "", minPriceCents: undefined, maxPriceCents: undefined, hasImage: false, postedToday: false, page: 1 })}>
              clear filters
            </Link>
            {" · "}
          </>
        )}
        <Link href={`/${region.slug}/post`}>be the first to post</Link>
        {" · "}
        <Link href={`/${region.slug}`}>back to {region.slug}</Link>
      </p>
    </div>
  );
}

/** Left sidebar: a plain GET form, so filters work without JavaScript. */
function Filters({ region, f }: { region: Region; f: ListingFilters }) {
  const dollars = (c?: number) => (c === undefined ? "" : String(c / 100));
  return (
    <aside>
      <form action={`/${region.slug}/search`} className="space-y-3 border border-rule bg-bar/40 p-3 text-[13px]">
        <div>
          <label htmlFor="f-query" className="sr-only">
            search
          </label>
          <input id="f-query" name="query" type="search" defaultValue={f.query} placeholder={`search ${region.slug}`} className="w-full" />
        </div>
        <div>
          <label htmlFor="f-cat" className="mb-0.5 block font-bold">
            category
          </label>
          <select
            id="f-cat"
            name="cat"
            defaultValue={f.category !== "all" ? f.category : f.section !== "all" ? `@${f.section}` : ""}
            className="w-full"
          >
            <option value="">all categories</option>
            {SECTIONS.map((s) => (
              <optgroup key={s.id} label={s.label}>
                <option value={`@${s.id}`}>all {s.label}</option>
                {s.categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-school" className="mb-0.5 block font-bold">
            campus
          </label>
          <select id="f-school" name="school" defaultValue={f.schoolId === "all" ? "" : f.schoolId} className="w-full">
            <option value="">all campuses</option>
            {region.schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="mb-0.5 font-bold">price</legend>
          <div className="flex items-center gap-1">
            <label htmlFor="f-min" className="sr-only">
              min price
            </label>
            <input id="f-min" name="min_price" inputMode="decimal" defaultValue={dollars(f.minPriceCents)} placeholder="min" className="w-full" />
            <span>–</span>
            <label htmlFor="f-max" className="sr-only">
              max price
            </label>
            <input id="f-max" name="max_price" inputMode="decimal" defaultValue={dollars(f.maxPriceCents)} placeholder="max" className="w-full" />
          </div>
        </fieldset>
        <div className="space-y-1">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="has_pic" value="1" defaultChecked={f.hasImage} /> has image
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="today" value="1" defaultChecked={f.postedToday} /> posted today
          </label>
        </div>
        {f.sort !== "newest" && <input type="hidden" name="sort" value={f.sort === "price-asc" ? "priceasc" : "pricedsc"} />}
        {f.view !== "list" && <input type="hidden" name="view" value={f.view} />}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn">
            update search
          </button>
          <Link href={`/${region.slug}/search${f.category !== "all" ? `?cat=${encodeURIComponent(f.category)}` : f.section !== "all" ? `?section=${f.section}` : ""}`}>
            reset
          </Link>
        </div>
        {(f.minPriceCents !== undefined || f.maxPriceCents !== undefined) && (
          <p className="text-zinc-500">
            {f.minPriceCents !== undefined && `from ${formatPrice(f.minPriceCents)} `}
            {f.maxPriceCents !== undefined && `up to ${formatPrice(f.maxPriceCents)}`}
          </p>
        )}
      </form>
    </aside>
  );
}
