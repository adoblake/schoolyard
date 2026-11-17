import { Suspense } from "react";
import { Footer, TopBar } from "@/components/cl";
import { ListingDetail, ListingNotFound } from "@/components/listing-detail";
import { CATEGORY_LABELS, sectionOf } from "@/lib/categories";
import { getListing, getViewerId } from "@/lib/queries";

export default function ListingPage({ params }: PageProps<"/[region]/listing/[id]">) {
  // Listing ids aren't known at build time, so params are only read inside Suspense.
  return (
    <Suspense fallback={<div className="h-9 border-b border-rule bg-bar/60" />}>
      <ListingContent params={params} />
    </Suspense>
  );
}

async function ListingContent({ params }: { params: PageProps<"/[region]/listing/[id]">["params"] }) {
  const { region, id } = await params;
  const [listing, viewerId] = await Promise.all([getListing(id), getViewerId()]);
  if (!listing || listing.regionSlug !== region) {
    return (
      <div>
        <TopBar regionSlug={region} crumbs={[{ label: region, href: `/${region}` }]} />
        <ListingNotFound regionSlug={region} />
        <Footer />
      </div>
    );
  }
  const section = sectionOf(listing.category);
  return (
    <div>
      <TopBar
        regionSlug={region}
        crumbs={[
          { label: region, href: `/${region}` },
          { label: section.label, href: `/${region}/search?section=${section.id}` },
          { label: CATEGORY_LABELS[listing.category], href: `/${region}/search?cat=${encodeURIComponent(listing.category)}` },
        ]}
      />
      <ListingDetail listing={listing} isOwner={viewerId === listing.sellerId} signedIn={!!viewerId} />
      <Footer />
    </div>
  );
}
