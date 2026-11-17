import { Suspense } from "react";
import { ListingDetail, ListingNotFound } from "@/components/listing-detail";
import { getListing, getViewerId } from "@/lib/queries";

export default function ListingPage({ params }: PageProps<"/[region]/listing/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <ListingContent params={params} />
    </Suspense>
  );
}

async function ListingContent({ params }: { params: PageProps<"/[region]/listing/[id]">["params"] }) {
  const { region, id } = await params;
  const [listing, viewerId] = await Promise.all([getListing(id), getViewerId()]);
  if (!listing || listing.regionSlug !== region) return <ListingNotFound regionSlug={region} />;
  return <ListingDetail listing={listing} isOwner={viewerId === listing.sellerId} signedIn={!!viewerId} />;
}
