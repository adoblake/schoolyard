import type { Region } from "./types";

/**
 * Regions and schools. Kept in code so region pages can be prerendered without
 * a database call. MUST match the `regions` / `schools` tables
 * (supabase/migrations/*_seed_reference_data.sql); the database enforces
 * that a listing's school belongs to its region.
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
