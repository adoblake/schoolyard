"use client";

import { useState } from "react";
import { Sheet } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import type { ListingFilters, SortOrder } from "@/lib/types";

const SORT_LABELS: Record<SortOrder, string> = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

function centsToInput(cents?: number) {
  return cents === undefined ? "" : String(cents / 100);
}

export function FilterSheet({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  filters: ListingFilters;
  /** min/max are dollar strings ("" = no bound). */
  onApply: (min: string | undefined, max: string | undefined, sort: SortOrder) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Price & sort">
      {/* Remount on open so the form starts from the current filters. */}
      {open && <FilterForm filters={filters} onApply={onApply} />}
    </Sheet>
  );
}

function FilterForm({
  filters,
  onApply,
}: {
  filters: ListingFilters;
  onApply: (min: string | undefined, max: string | undefined, sort: SortOrder) => void;
}) {
  const [min, setMin] = useState(centsToInput(filters.minPriceCents));
  const [max, setMax] = useState(centsToInput(filters.maxPriceCents));
  const [sort, setSort] = useState<SortOrder>(filters.sort);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(min.trim() || undefined, max.trim() || undefined, sort);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Min price ($)</span>
          <input
            inputMode="decimal"
            type="number"
            min={0}
            step="any"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 p-3 text-sm"
            placeholder="0"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Max price ($)</span>
          <input
            inputMode="decimal"
            type="number"
            min={0}
            step="any"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 p-3 text-sm"
            placeholder="any"
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Sort</legend>
        <div className="space-y-1">
          {(Object.keys(SORT_LABELS) as SortOrder[]).map((value) => (
            <label key={value} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-zinc-50">
              <input
                type="radio"
                name="sort"
                value={value}
                checked={sort === value}
                onChange={() => setSort(value)}
              />
              {SORT_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-2xl"
          onClick={() => {
            setMin("");
            setMax("");
            setSort("newest");
          }}
        >
          Clear
        </Button>
        <Button type="submit" className="h-12 flex-1 rounded-2xl">
          Show results
        </Button>
      </div>
    </form>
  );
}
