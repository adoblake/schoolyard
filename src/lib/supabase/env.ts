/**
 * Supabase project settings. Both values are public by design (they ship to
 * every browser); data is protected by row-level security. Defaults point at
 * the SchoolYard project so a fresh deploy works with no configuration;
 * override them with environment variables to use another project.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yyrbpxpkvlkefpkaooxg.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_2fTJIbfpJMu8cac5E-TowA_0IjiJC3A";

export const PHOTO_BUCKET = "listing-photos";

export function photoUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${storagePath}`;
}
