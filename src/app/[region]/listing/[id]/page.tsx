import { Suspense } from "react";
import { ListingDetail } from "@/components/listing-detail";

export default function ListingPage({ params }: PageProps<"/[region]/listing/[id]">) {
  return (
    // Listing ids aren't known at build time (and Phase 0 posts live in the browser).
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <ListingContent params={params} />
    </Suspense>
  );
}

async function ListingContent({ params }: { params: PageProps<"/[region]/listing/[id]">["params"] }) {
  const { region, id } = await params;
  return <ListingDetail regionSlug={region} id={id} />;
}
