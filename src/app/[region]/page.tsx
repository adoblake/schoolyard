import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseControls } from "@/components/browse-view";
import { ListingList, ListingListSkeleton, PostFirstLink } from "@/components/listing-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRegion } from "@/lib/data";
import { paramSource, parseFilters } from "@/lib/listings";
import { searchListings } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/[region]">): Promise<Metadata> {
  const { region } = await params;
  const r = getRegion(region);
  return r ? { title: `${r.name} · student classifieds`, description: r.subtitle } : {};
}

export default async function BrowsePage({ params, searchParams }: PageProps<"/[region]">) {
  const { region: slug } = await params;
  const region = getRegion(slug)!;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SiteHeader region={region} />
      <main className="mx-auto max-w-md pb-24">
        {/* Controls read the URL in the browser; the fallback keeps the layout steady. */}
        <Suspense fallback={<div className="h-[420px] bg-white" />}>
          <BrowseControls regionSlug={slug} />
        </Suspense>
        <section className="px-4 py-3">
          <Suspense
            fallback={
              <>
                <ResultsHeading />
                <ListingListSkeleton />
              </>
            }
          >
            <Results regionSlug={slug} searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultsHeading({ count }: { count?: number }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">latest listings</h2>
      {count !== undefined && (
        <span className="text-xs text-zinc-400" aria-live="polite">
          {count} {count === 1 ? "result" : "results"}
        </span>
      )}
    </div>
  );
}

async function Results({
  regionSlug,
  searchParams,
}: {
  regionSlug: string;
  searchParams: PageProps<"/[region]">["searchParams"];
}) {
  const region = getRegion(regionSlug)!;
  const filters = parseFilters(region, paramSource(await searchParams));
  const { listings, error } = await searchListings(filters);
  const filtered =
    filters.schoolId !== "all" ||
    filters.category !== "all" ||
    !!filters.query ||
    filters.minPriceCents !== undefined ||
    filters.maxPriceCents !== undefined;

  return (
    <>
      <ResultsHeading count={listings.length} />
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <ListingList
          listings={listings}
          empty={
            filtered ? (
              "Nothing matches yet. Try another college, category or search."
            ) : (
              <>
                No listings in {region.name} yet. Be the first: <PostFirstLink regionSlug={region.slug} />.
              </>
            )
          }
        />
      )}
    </>
  );
}
