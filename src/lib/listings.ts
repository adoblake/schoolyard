import { getSection, priceKind } from "./categories";
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
 * Reads search filters from the URL, Craigslist style:
 * ?cat=books&school=gcu&query=lamp&min_price=5&max_price=40&has_pic=1&today=1&sort=priceasc&view=gallery&page=2
 * Unknown or out-of-region values fall back to defaults rather than erroring.
 */
export function parseFilters(region: Region, params: ParamSource): ListingFilters {
  const school = params.get("school");
  // The search form sends a whole section as cat=@forsale; links use section=forsale.
  const catParam = params.get("cat");
  const cat = catParam?.startsWith("@") ? null : catParam;
  const section = catParam?.startsWith("@") ? catParam.slice(1) : params.get("section");
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  return {
    regionSlug: region.slug,
    schoolId: school && region.schools.some((s) => s.id === school) ? school : "all",
    category: cat && (CATEGORIES as readonly string[]).includes(cat) ? (cat as Category) : "all",
    section: section && getSection(section) ? section : "all",
    query: (params.get("query") ?? "").slice(0, 100),
    minPriceCents: parseDollarsToCents(params.get("min_price")),
    maxPriceCents: parseDollarsToCents(params.get("max_price")),
    hasImage: params.get("has_pic") === "1",
    postedToday: params.get("today") === "1",
    sort: sort === "priceasc" ? "price-asc" : sort === "pricedsc" ? "price-desc" : "newest",
    view: params.get("view") === "gallery" ? "gallery" : "list",
    page: Number.isInteger(page) && page > 1 ? Math.min(page, 100) : 1,
  };
}

/** Builds a search URL from filters, leaving out defaults so links stay short. */
export function searchHref(filters: ListingFilters, patch: Partial<ListingFilters> = {}): string {
  const f = { ...filters, ...patch };
  const q = new URLSearchParams();
  if (f.category !== "all") q.set("cat", f.category);
  else if (f.section !== "all") q.set("section", f.section);
  if (f.schoolId !== "all") q.set("school", f.schoolId);
  if (f.query) q.set("query", f.query);
  if (f.minPriceCents !== undefined) q.set("min_price", String(f.minPriceCents / 100));
  if (f.maxPriceCents !== undefined) q.set("max_price", String(f.maxPriceCents / 100));
  if (f.hasImage) q.set("has_pic", "1");
  if (f.postedToday) q.set("today", "1");
  if (f.sort !== "newest") q.set("sort", f.sort === "price-asc" ? "priceasc" : "pricedsc");
  if (f.view !== "list") q.set("view", f.view);
  if (f.page > 1) q.set("page", String(f.page));
  const qs = q.toString();
  return `/${f.regionSlug}/search${qs ? `?${qs}` : ""}`;
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

/** Price as shown on a listing: "$45", "$650/mo", "free", or "" when the category has no price. */
export function formatListingPrice(cents: number, category: Category): string {
  const kind = priceKind(category);
  if (kind === null) return category === "free" ? "free" : "";
  if (kind === "rent" && cents > 0) return `${formatPrice(cents)}/mo`;
  return formatPrice(cents);
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
