"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, LoaderCircle, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { RegionPicker } from "@/components/region-picker";
import { FilterSheet } from "@/components/filter-sheet";
import { getRegion } from "@/lib/data";
import { formatPrice, parseFilters } from "@/lib/listings";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Browse filters (college, search, categories, price & sort). Filters live in
 * the URL, and changing them re-renders the server-side results below.
 */
export function BrowseControls({ regionSlug }: { regionSlug: string }) {
  const region = getRegion(regionSlug)!;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(region, params);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.query);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function setParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounce typing so we don't query on every keystroke.
  const setParamsRef = useRef(setParams);
  useEffect(() => {
    setParamsRef.current = setParams;
  });
  useEffect(() => {
    if (query.trim() === (params.get("q") ?? "")) return;
    const t = setTimeout(() => setParamsRef.current({ q: query.trim() }), 300);
    return () => clearTimeout(t);
  }, [query, params]);

  const priceActive =
    filters.minPriceCents !== undefined || filters.maxPriceCents !== undefined || filters.sort !== "newest";

  return (
    <>
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
          {isPending ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-zinc-400" aria-label="Loading" />
          ) : (
            <Search className="h-5 w-5 text-zinc-400" aria-hidden />
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setParams({ q: query.trim() });
            }}
            maxLength={100}
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
        {priceActive && (
          <p className="mt-2 text-xs text-zinc-500">
            {filters.minPriceCents !== undefined && `from ${formatPrice(filters.minPriceCents)} `}
            {filters.maxPriceCents !== undefined && `up to ${formatPrice(filters.maxPriceCents)} `}
            {filters.sort !== "newest" &&
              `· sorted by price ${filters.sort === "price-asc" ? "low→high" : "high→low"}`}
          </p>
        )}
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
    </>
  );
}
