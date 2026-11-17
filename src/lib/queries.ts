import "server-only";
import { getSection } from "./categories";
import { toPrefixTsQuery } from "./listings";
import { createClient, createPublicClient } from "./supabase/server";
import { photoUrl } from "./supabase/env";
import type { Listing, ListingFilters } from "./types";

/** Columns + joins needed to build a Listing. */
export const LISTING_SELECT = `
  id, region_slug, school_id, title, price_cents, category, condition, area,
  description, created_at, status, seller_id,
  seller:profiles!listings_seller_id_fkey ( display_name, verified_domain ),
  listing_photos ( storage_path, position )
` as const;

type ListingRow = {
  id: string;
  region_slug: string;
  school_id: string;
  title: string;
  price_cents: number;
  category: Listing["category"];
  condition: Listing["condition"];
  area: string;
  description: string;
  created_at: string;
  status: Listing["status"];
  seller_id: string;
  seller: { display_name: string; verified_domain: string | null } | null;
  listing_photos: { storage_path: string; position: number }[];
};

export function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    regionSlug: row.region_slug,
    schoolId: row.school_id,
    title: row.title,
    priceCents: row.price_cents,
    category: row.category,
    condition: row.condition,
    area: row.area,
    description: row.description,
    sellerId: row.seller_id,
    sellerName: row.seller?.display_name || "SchoolYard member",
    sellerDomain: row.seller?.verified_domain ?? null,
    postedAt: row.created_at,
    status: row.status,
    photos: [...row.listing_photos].sort((a, b) => a.position - b.position).map((p) => photoUrl(p.storage_path)),
  };
}

export const PAGE_SIZE = 60;

export type SearchResult = { listings: Listing[]; total: number; error: string | null };

/** Active listings for the search page (public data, no cookies). */
export async function searchListings(filters: ListingFilters): Promise<SearchResult> {
  const supabase = await createPublicClient();
  const select = filters.hasImage ? LISTING_SELECT.replace("listing_photos (", "listing_photos!inner (") : LISTING_SELECT;
  let q = supabase
    .from("listings")
    .select(select, { count: "exact" })
    .eq("region_slug", filters.regionSlug)
    .eq("status", "active");

  if (filters.schoolId !== "all") q = q.eq("school_id", filters.schoolId);
  if (filters.category !== "all") q = q.eq("category", filters.category);
  else if (filters.section !== "all") q = q.in("category", getSection(filters.section)?.categories ?? []);
  if (filters.minPriceCents !== undefined) q = q.gte("price_cents", filters.minPriceCents);
  if (filters.maxPriceCents !== undefined) q = q.lte("price_cents", filters.maxPriceCents);
  if (filters.postedToday) q = q.gte("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());

  const tsquery = toPrefixTsQuery(filters.query);
  if (tsquery) q = q.textSearch("search", tsquery, { config: "english" });

  if (filters.sort === "price-asc") q = q.order("price_cents", { ascending: true });
  else if (filters.sort === "price-desc") q = q.order("price_cents", { ascending: false });
  const from = (filters.page - 1) * PAGE_SIZE;
  q = q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await q;
  if (error) {
    // Asking for a page past the end isn't a real error.
    if (error.code === "PGRST103") return { listings: [], total: count ?? 0, error: null };
    console.error("searchListings failed", error);
    return { listings: [], total: 0, error: "Couldn't load listings. Try again in a moment." };
  }
  return { listings: (data as unknown as ListingRow[]).map(toListing), total: count ?? 0, error: null };
}

/**
 * One listing, read as the current user so sellers can still see their own
 * sold/expired listings. Returns null if it doesn't exist or isn't visible.
 */
export async function getListing(id: string): Promise<Listing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(LISTING_SELECT).eq("id", id).maybeSingle();
  if (error) {
    console.error("getListing failed", error);
    return null;
  }
  return data ? toListing(data as unknown as ListingRow) : null;
}

export type Profile = {
  id: string;
  email: string | null;
  displayName: string;
  schoolId: string | null;
  verifiedDomain: string | null;
};

/** The signed-in user's profile, or null when signed out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, school_id, verified_domain")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    email: (claims.claims.email as string | undefined) ?? null,
    displayName: data.display_name,
    schoolId: data.school_id,
    verifiedDomain: data.verified_domain,
  };
}

export function isProfileComplete(p: Profile | null): p is Profile {
  return !!p && !!p.displayName.trim() && !!p.schoolId && !!p.verifiedDomain;
}

/** School ids a verified domain covers (e.g. asu.edu → Tempe, Downtown). */
export async function getSchoolsForDomain(domain: string | null): Promise<string[]> {
  if (!domain) return [];
  const supabase = await createPublicClient();
  const { data } = await supabase.from("school_email_domains").select("school_id").eq("domain", domain);
  return (data ?? []).map((d) => d.school_id);
}

/** Listings the current user saved (active ones, plus their own). */
export async function getSavedListings(userId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_listings")
    .select(`created_at, listing:listings ( ${LISTING_SELECT} )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getSavedListings failed", error);
    return [];
  }
  return (data as unknown as { listing: ListingRow | null }[])
    .map((r) => r.listing)
    .filter((l): l is ListingRow => !!l)
    .map(toListing);
}

/** All of a seller's own listings, any status. */
export async function getMyListings(userId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyListings failed", error);
    return [];
  }
  return (data as unknown as ListingRow[]).map(toListing);
}

/** Signed-in user's id from the verified auth token, or null. */
export async function getViewerId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}
