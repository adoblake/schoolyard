import type { Category } from "./types";

/**
 * Craigslist-style directory: sections, each with categories. The order here is
 * the order on the city home page and in the posting flow.
 */
export type Section = { id: string; label: string; categories: Category[] };

export const SECTIONS: Section[] = [
  {
    id: "forsale",
    label: "for sale",
    categories: ["books", "electronics", "furniture", "dorm/apartment", "supplies", "clothing", "bikes", "tickets", "free", "wanted"],
  },
  { id: "housing", label: "housing", categories: ["sublets", "roommates"] },
  { id: "services", label: "services", categories: ["tutoring", "services"] },
  { id: "community", label: "community", categories: ["lost_found", "study_groups"] },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  books: "books & textbooks",
  electronics: "electronics",
  furniture: "furniture",
  "dorm/apartment": "dorm & apartment",
  supplies: "school supplies",
  clothing: "clothing & accessories",
  bikes: "bikes & scooters",
  tickets: "tickets",
  free: "free stuff",
  wanted: "wanted",
  sublets: "sublets & leases",
  roommates: "rooms & roommates",
  tutoring: "tutoring",
  services: "other services",
  lost_found: "lost & found",
  study_groups: "study groups",
};

export function sectionOf(category: Category): Section {
  return SECTIONS.find((s) => s.categories.includes(category))!;
}

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

/** What the price field means for a category, or null when there's no price. */
export function priceKind(category: Category): "price" | "budget" | "rent" | "rate" | null {
  if (category === "free") return null;
  if (category === "wanted") return "budget";
  const section = sectionOf(category).id;
  if (section === "housing") return "rent";
  if (section === "services") return "rate";
  if (section === "community") return null;
  return "price";
}

/** Condition only applies to physical items for sale. */
export function hasCondition(category: Category): boolean {
  return sectionOf(category).id === "forsale" && category !== "wanted" && category !== "tickets";
}

export const PRICE_LABELS = { price: "price", budget: "budget", rent: "rent / month", rate: "rate" } as const;
