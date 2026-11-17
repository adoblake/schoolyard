import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseView } from "@/components/browse-view";
import { getRegion } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/[region]">): Promise<Metadata> {
  const { region } = await params;
  const r = getRegion(region);
  return r ? { title: `${r.name} · student classifieds`, description: r.subtitle } : {};
}

export default async function BrowsePage({ params }: PageProps<"/[region]">) {
  const { region } = await params;
  return (
    // BrowseView reads filters from the URL, which is only known in the browser.
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <BrowseView regionSlug={region} />
    </Suspense>
  );
}
