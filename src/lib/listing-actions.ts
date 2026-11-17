"use client";

import { createClient } from "./supabase/client";
import { PHOTO_BUCKET } from "./supabase/env";
import type { ListingStatus } from "./types";

/** Seller actions. Row-level security makes these no-ops for anyone but the seller. */

export async function setListingStatus(id: string, status: Extract<ListingStatus, "active" | "sold">) {
  const { error } = await createClient().from("listings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  const { data: photos } = await supabase.from("listing_photos").select("storage_path").eq("listing_id", id);
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const paths = (photos ?? []).map((p) => p.storage_path);
  if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

/** Flag a listing for review (signed-in users only; stored in reports). */
export async function flagListing(listingId: string, reason: string) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error("Sign in to flag postings.");
  const { error } = await supabase.from("reports").insert({ reporter_id: uid, listing_id: listingId, reason });
  if (error) throw new Error(error.message);
}
