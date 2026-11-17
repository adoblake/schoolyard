import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Footer, SignInNotice, TopBar } from "@/components/cl";
import { ResultList } from "@/components/results";
import { getSavedListings, getViewerId } from "@/lib/queries";

export const metadata: Metadata = { title: "favorites · SchoolYard" };

export default async function FavoritesPage({ params }: PageProps<"/[region]/saved">) {
  const { region } = await params;
  return (
    <div>
      <TopBar regionSlug={region} crumbs={[{ label: region, href: `/${region}` }, { label: "favorites" }]} />
      <main className="mx-auto max-w-6xl px-3 pt-3">
        <h1 className="bar mb-3">favorites</h1>
        <Suspense fallback={<p className="text-zinc-500">loading…</p>}>
          <Favorites regionSlug={region} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function Favorites({ regionSlug }: { regionSlug: string }) {
  const userId = await getViewerId();
  if (!userId) {
    return <SignInNotice next={`/${regionSlug}/saved`}>Log in to keep favorites and find them here later.</SignInNotice>;
  }
  const listings = await getSavedListings(userId);
  if (listings.length === 0) {
    return (
      <p>
        No favorites yet. Click the ☆ next to any posting to save it here.{" "}
        <Link href={`/${regionSlug}`}>Browse {regionSlug}</Link>
      </p>
    );
  }
  return <ResultList listings={listings} showStatus />;
}
