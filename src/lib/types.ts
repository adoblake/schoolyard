export const CATEGORIES = [
  "books",
  "furniture",
  "electronics",
  "supplies",
  "free",
  "wanted",
  "services",
  "dorm/apartment",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["new", "like new", "good", "fair", "for parts"] as const;

export type Condition = (typeof CONDITIONS)[number];

export type School = {
  /** Stable id, used in URLs and stored on listings. */
  id: string;
  name: string;
};

export type Region = {
  /** URL segment, e.g. "phoenix" → /phoenix */
  slug: string;
  /** Craigslist-style label shown under the logo, e.g. "phoenix.schoolyard". */
  label: string;
  name: string;
  subtitle: string;
  schools: School[];
};

export type ListingStatus = "active" | "sold" | "expired" | "removed";

export type Listing = {
  id: string;
  regionSlug: string;
  schoolId: string;
  title: string;
  /** Whole cents. 0 means free. */
  priceCents: number;
  category: Category;
  condition: Condition;
  /** Pickup spot, e.g. "near Noble Library". */
  area: string;
  description: string;
  sellerId: string;
  sellerName: string;
  /** School email domain the seller verified, e.g. "asu.edu". */
  sellerDomain: string | null;
  /** ISO timestamp. */
  postedAt: string;
  status: ListingStatus;
  /** Public photo URLs, in display order. */
  photos: string[];
};

export type SortOrder = "newest" | "price-asc" | "price-desc";

export type ListingFilters = {
  regionSlug: string;
  /** School id, or "all". */
  schoolId: string;
  /** Category, or "all". */
  category: Category | "all";
  query: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sort: SortOrder;
};
