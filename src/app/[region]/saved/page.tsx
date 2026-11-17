import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingList, ListingListSkeleton } from "@/components/listing-list";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { SiteHeader } from "@/components/site-header";
import { getRegion } from "@/lib/data";
import { getSavedListings, getViewerId } from "@/lib/queries";

export const metadata: Metadata = { title: "Saved · SchoolYard" };

export default async function SavedPage({ params }: PageProps<"/[region]/saved">) {
  const { region: slug } = await params;
  const region = getRegion(slug)!;
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <SiteHeader region={region} />
      <main className="mx-auto max-w-md px-4 py-4 pb-24">
        <h1 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">saved listings</h1>
        <Suspense fallback={<ListingListSkeleton />}>
          <SavedList regionSlug={slug} />
        </Suspense>
      </main>
    </div>
  );
}

async function SavedList({ regionSlug }: { regionSlug: string }) {
  const userId = await getViewerId();
  if (!userId) {
    return <SignInPrompt next={`/${regionSlug}/saved`}>Sign in to save listings and find them here later.</SignInPrompt>;
  }
  const listings = await getSavedListings(userId);
  return (
    <ListingList
      listings={listings}
      empty={
        <>
          Nothing saved yet. Tap <span className="font-medium">save</span> on a listing to keep it here.
          <div className="mt-4">
            <Link href={`/${regionSlug}`} className="font-medium text-zinc-900 underline">
              Browse listings
            </Link>
          </div>
        </>
      }
    />
  );
}
