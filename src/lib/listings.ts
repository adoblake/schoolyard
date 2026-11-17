import { CATEGORIES, type Category, type ListingFilters, type Region, type SortOrder } from "./types";

export const SORTS: SortOrder[] = ["newest", "price-asc", "price-desc"];

type ParamSource = { get(name: string): string | null };

/** Wraps Next's searchParams object (or URLSearchParams) in a common shape. */
export function paramSource(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ParamSource {
  if (params instanceof URLSearchParams) return params;
  return {
    get(name) {
      const v = params[name];
      return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
    },
  };
}

function parseDollarsToCents(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

/**
 * Reads browse filters from the URL (?school=gcu&cat=books&q=lamp&min=5&max=40&sort=price-asc).
 * Unknown or out-of-region values fall back to "all" rather than erroring.
 */
export function parseFilters(region: Region, params: ParamSource): ListingFilters {
  const school = params.get("school");
  const cat = params.get("cat");
  const sort = params.get("sort");
  return {
    regionSlug: region.slug,
    schoolId: school && region.schools.some((s) => s.id === school) ? school : "all",
    category: cat && (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : "all",
    query: (params.get("q") ?? "").slice(0, 100),
    minPriceCents: parseDollarsToCents(params.get("min")),
    maxPriceCents: parseDollarsToCents(params.get("max")),
    sort: sort && (SORTS as string[]).includes(sort) ? (sort as SortOrder) : "newest",
  };
}

/**
 * Turns free text into a Postgres to_tsquery string with prefix matching, so
 * "calc text" finds "calculator textbook". Strips everything but letters and
 * digits, so user input can't inject tsquery operators. Returns null if empty.
 */
export function toPrefixTsQuery(query: string): string | null {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 8);
  return terms.length ? terms.map((t) => `${t}:*`).join(" & ") : null;
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

/** Only allow same-site relative paths as post-login redirect targets. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
