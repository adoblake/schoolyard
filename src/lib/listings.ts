import { getSchoolName } from "./data";
import type { Listing, ListingFilters } from "./types";

export const DEFAULT_FILTERS: Omit<ListingFilters, "regionSlug"> = {
  schoolId: "all",
  category: "all",
  query: "",
  sort: "newest",
};

/**
 * Filters and sorts listings for the browse screen.
 * Region is always applied first — the prototype skipped this, so picking
 * Tucson still showed Phoenix listings.
 */
export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);

  const result = listings.filter((item) => {
    if (item.regionSlug !== filters.regionSlug) return false;
    if (filters.schoolId !== "all" && item.schoolId !== filters.schoolId) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.minPriceCents !== undefined && item.priceCents < filters.minPriceCents) return false;
    if (filters.maxPriceCents !== undefined && item.priceCents > filters.maxPriceCents) return false;

    if (terms.length > 0) {
      const haystack = [
        item.title,
        item.description,
        item.area,
        item.category,
        getSchoolName(item.schoolId),
      ]
        .join(" ")
        .toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  return result.sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return a.priceCents - b.priceCents;
      case "price-desc":
        return b.priceCents - a.priceCents;
      default:
        return Date.parse(b.postedAt) - Date.parse(a.postedAt);
    }
  });
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "free";
  const dollars = cents / 100;
  return Number.isInteger(dollars)
    ? `$${dollars.toLocaleString("en-US")}`
    : `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Parses what a user types into a price box ("$42", "42.50", "1,200") into cents.
 * Returns null for anything that isn't a non-negative amount.
 */
export function parsePriceToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

export function formatTimeAgo(iso: string, now: number): string {
  const diff = Math.max(0, now - Date.parse(iso));
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
