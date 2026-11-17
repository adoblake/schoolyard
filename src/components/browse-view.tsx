"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { DemoBanner } from "@/components/listing-bits";
import { ListingCard } from "@/components/listing-card";
import { RegionPicker } from "@/components/region-picker";
import { SiteHeader } from "@/components/site-header";
import { FilterSheet } from "@/components/filter-sheet";
import { getRegion } from "@/lib/data";
import { DEFAULT_FILTERS, filterListings, formatPrice } from "@/lib/listings";
import { useAllListings } from "@/lib/local-store";
import { CATEGORIES, type Category, type ListingFilters, type Region, type SortOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORTS: SortOrder[] = ["newest", "price-asc", "price-desc"];

function parseCents(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

/**
 * Filters live in the URL (?school=gcu&cat=books&q=lamp) so they survive
 * navigation and reloads and can be shared as links.
 */
function useBrowseFilters(region: Region) {
  const params = useSearchParams();

  const filters: ListingFilters = useMemo(() => {
    const school = params.get("school");
    const cat = params.get("cat");
    const sort = params.get("sort");
    return {
      regionSlug: region.slug,
      schoolId: school && region.schools.some((s) => s.id === school) ? school : "all",
      category: cat && (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : "all",
      query: params.get("q") ?? "",
      minPriceCents: parseCents(params.get("min")),
      maxPriceCents: parseCents(params.get("max")),
      sort: sort && (SORTS as string[]).includes(sort) ? (sort as SortOrder) : DEFAULT_FILTERS.sort,
    };
  }, [params, region]);

  function setParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    // Native history updates are picked up by useSearchParams without a server round trip.
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  return { filters, setParams };
}

export function BrowseView({ regionSlug }: { regionSlug: string }) {
  const region = getRegion(regionSlug)!;
  const listings = useAllListings();
  const { filters, setParams } = useBrowseFilters(region);
  const [query, setQuery] = useState(filters.query);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => filterListings(listings, filters), [listings, filters]);

  const priceActive =
    filters.minPriceCents !== undefined || filters.maxPriceCents !== undefined || filters.sort !== "newest";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SiteHeader region={region} />
      <DemoBanner />

      <main className="mx-auto max-w-md pb-24">
        <section className="bg-white px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mb-3 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-left transition hover:bg-zinc-100"
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" aria-hidden /> {region.name}
              </span>
              <span className="text-xs font-medium text-zinc-500">change</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {region.subtitle}
            </div>
          </button>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by college">
            {[{ id: "all", name: "all colleges" }, ...region.schools].map((school) => {
              const active = filters.schoolId === school.id;
              return (
                <button
                  type="button"
                  key={school.id}
                  onClick={() => setParams({ school: school.id })}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold",
                    active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600",
                  )}
                >
                  {school.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
            <Search className="h-5 w-5 text-zinc-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setParams({ q: e.target.value });
              }}
              placeholder="search school stuff"
              aria-label="Search listings"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Price and sort"
              className={cn("relative rounded-lg p-1 hover:bg-zinc-100", priceActive ? "text-zinc-900" : "text-zinc-400")}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {priceActive && <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-rose-500" />}
            </button>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white px-4 py-3">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">categories</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["all", ...CATEGORIES] as const).map((cat) => {
              const active = filters.category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setParams({ cat })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
                    active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">latest listings</h2>
            <span className="text-xs text-zinc-400" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>

          {priceActive && (
            <p className="mb-2 text-xs text-zinc-500">
              {filters.minPriceCents !== undefined && `from ${formatPrice(filters.minPriceCents)} `}
              {filters.maxPriceCents !== undefined && `up to ${formatPrice(filters.maxPriceCents)} `}
              {filters.sort !== "newest" && `· sorted by price ${filters.sort === "price-asc" ? "low→high" : "high→low"}`}
            </p>
          )}

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
              Nothing matches yet. Try another college or category, or post the first one.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <RegionPicker open={pickerOpen} onClose={() => setPickerOpen(false)} current={region} />
      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(min, max, sort) => {
          setParams({ min, max, sort: sort === "newest" ? undefined : sort });
          setFiltersOpen(false);
        }}
      />
    </div>
  );
}
