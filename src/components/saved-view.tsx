"use client";

import Link from "next/link";
import { DemoBanner } from "@/components/listing-bits";
import { ListingCard } from "@/components/listing-card";
import { SiteHeader } from "@/components/site-header";
import { getRegion } from "@/lib/data";
import { useAllListings, useSaved } from "@/lib/local-store";

export function SavedView({ regionSlug }: { regionSlug: string }) {
  const region = getRegion(regionSlug)!;
  const listings = useAllListings();
  const { savedIds } = useSaved();
  const saved = listings.filter((l) => savedIds.includes(l.id));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SiteHeader region={region} />
      <DemoBanner />
      <main className="mx-auto max-w-md px-4 py-4 pb-24">
        <h1 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">saved listings</h1>
        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            Nothing saved yet. Tap <span className="font-medium">save</span> on a listing to keep it here.
            <div className="mt-4">
              <Link href={`/${region.slug}`} className="font-medium text-zinc-900 underline">
                Browse {region.name}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
