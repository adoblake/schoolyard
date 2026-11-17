import type { Listing, Region } from "./types";

/**
 * Regions and schools. Hard-coded for Phase 0; these move to the
 * `regions` / `schools` tables in Phase 1 (see supabase/migrations).
 */
export const REGIONS: Region[] = [
  {
    slug: "phoenix",
    label: "phoenix.schoolyard",
    name: "Phoenix SchoolYard",
    subtitle: "Phoenix metro student classifieds",
    schools: [
      { id: "asu-tempe", name: "ASU Tempe" },
      { id: "asu-downtown", name: "ASU Downtown" },
      { id: "gcu", name: "GCU" },
      { id: "mesa-cc", name: "Mesa CC" },
      { id: "scottsdale-cc", name: "Scottsdale CC" },
    ],
  },
  {
    slug: "tucson",
    label: "tucson.schoolyard",
    name: "Tucson SchoolYard",
    subtitle: "Tucson area student classifieds",
    schools: [
      { id: "uarizona", name: "University of Arizona" },
      { id: "pima-cc", name: "Pima CC" },
    ],
  },
  {
    slug: "flagstaff",
    label: "flagstaff.schoolyard",
    name: "Flagstaff SchoolYard",
    subtitle: "Northern Arizona student classifieds",
    schools: [
      { id: "nau", name: "NAU" },
      { id: "coconino-cc", name: "Coconino CC" },
    ],
  },
];

export const DEFAULT_REGION_SLUG = "phoenix";

export function getRegion(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function getSchoolName(schoolId: string): string {
  for (const region of REGIONS) {
    const school = region.schools.find((s) => s.id === schoolId);
    if (school) return school.name;
  }
  return schoolId;
}

const MINUTE = 60_000;

/** Seed timestamps are relative to page load so the demo always looks fresh. */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * MINUTE).toISOString();
}

/**
 * Demo listings. Sellers are fictional. Replaced by real rows in Phase 1.
 * The first three come straight from the original prototype.
 */
export const SEED_LISTINGS: Listing[] = [
  {
    id: "seed-1",
    regionSlug: "phoenix",
    schoolId: "asu-tempe",
    title: "BIO 181 textbook + lab notebook",
    priceCents: 4200,
    category: "books",
    condition: "good",
    area: "near Noble Library",
    description:
      "Used for BIO 181 last semester. Textbook has light highlighting, lab notebook is mostly unused. Pickup near Noble Library or MU. Cash, Zelle, or trade for a TI calculator.",
    sellerName: "Maya R.",
    sellerDomain: "asu.edu",
    postedAt: minutesAgo(18),
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop",
    origin: "seed",
  },
  {
    id: "seed-2",
    regionSlug: "phoenix",
    schoolId: "gcu",
    title: "Mini fridge for dorm room",
    priceCents: 5500,
    category: "dorm/apartment",
    condition: "good",
    area: "Camelback Hall",
    description:
      "Mini fridge. Kept it in my dorm for one year. Clean inside, freezer section still works. Moving out this weekend, so first pickup gets it.",
    sellerName: "Andre P.",
    sellerDomain: "gcu.edu",
    postedAt: minutesAgo(62),
    imageUrl:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=900&auto=format&fit=crop",
    origin: "seed",
  },
  {
    id: "seed-3",
    regionSlug: "phoenix",
    schoolId: "asu-downtown",
    title: "Art supply bundle: markers, pads, ruler",
    priceCents: 2500,
    category: "supplies",
    condition: "fair",
    area: "Design building lobby",
    description:
      "Bundle for intro design or drawing classes. Includes alcohol markers, sketch pads, metal ruler, glue sticks, and a few micron pens. Some markers are used but still good.",
    sellerName: "Leah S.",
    sellerDomain: "asu.edu",
    postedAt: minutesAgo(240),
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=900&auto=format&fit=crop",
    origin: "seed",
  },
  {
    id: "seed-4",
    regionSlug: "phoenix",
    schoolId: "mesa-cc",
    title: "Desk lamp + power strip",
    priceCents: 0,
    category: "free",
    condition: "good",
    area: "Southern & Dobson campus",
    description:
      "LED desk lamp (three brightness levels) and a six-outlet power strip. Free, just come grab them.",
    sellerName: "Chris T.",
    sellerDomain: "maricopa.edu",
    postedAt: minutesAgo(60 * 5),
    origin: "seed",
  },
  {
    id: "seed-5",
    regionSlug: "phoenix",
    schoolId: "scottsdale-cc",
    title: "WANTED: TI-84 Plus calculator",
    priceCents: 4000,
    category: "wanted",
    condition: "good",
    area: "anywhere near campus",
    description:
      "Looking for a working TI-84 Plus (CE is fine too) for MAT 151. Can pay up to $40.",
    sellerName: "Priya K.",
    sellerDomain: "maricopa.edu",
    postedAt: minutesAgo(60 * 26),
    origin: "seed",
  },
  {
    id: "seed-6",
    regionSlug: "tucson",
    schoolId: "uarizona",
    title: "IKEA desk chair, adjustable",
    priceCents: 3000,
    category: "furniture",
    condition: "like new",
    area: "near the Student Union",
    description:
      "Grey swivel desk chair, height adjustable. Bought in August, moving to a furnished place.",
    sellerName: "Jordan M.",
    sellerDomain: "arizona.edu",
    postedAt: minutesAgo(45),
    origin: "seed",
  },
  {
    id: "seed-7",
    regionSlug: "tucson",
    schoolId: "pima-cc",
    title: "Calculus tutoring (Calc I & II)",
    priceCents: 2000,
    category: "services",
    condition: "new",
    area: "West campus library",
    description:
      "Math tutor, A's in Calc I and II. $20/hour, can meet on campus or over video.",
    sellerName: "Sam L.",
    sellerDomain: "pima.edu",
    postedAt: minutesAgo(60 * 8),
    origin: "seed",
  },
  {
    id: "seed-8",
    regionSlug: "flagstaff",
    schoolId: "nau",
    title: "Winter jacket + snow boots (size 9)",
    priceCents: 6000,
    category: "dorm/apartment",
    condition: "good",
    area: "near the du Bois Center",
    description:
      "Insulated jacket (men's M) and waterproof boots, size 9. Survived two Flagstaff winters, still warm.",
    sellerName: "Taylor W.",
    sellerDomain: "nau.edu",
    postedAt: minutesAgo(90),
    origin: "seed",
  },
  {
    id: "seed-9",
    regionSlug: "flagstaff",
    schoolId: "coconino-cc",
    title: "Used laptop: 13\" Chromebook",
    priceCents: 8500,
    category: "electronics",
    condition: "fair",
    area: "Lone Tree campus",
    description:
      "Works fine for papers and browsing. Battery lasts about 4 hours. Comes with charger.",
    sellerName: "Riley J.",
    sellerDomain: "coconino.edu",
    postedAt: minutesAgo(60 * 30),
    origin: "seed",
  },
];
