import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import type { Listing } from "@/lib/types";

export function ListingList({
  listings,
  empty,
  hideActions,
}: {
  listings: Listing[];
  empty: React.ReactNode;
  hideActions?: boolean;
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
        {empty}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {listings.map((item) => (
        <ListingCard key={item.id} listing={item} hideActions={hideActions} />
      ))}
    </div>
  );
}

export function ListingListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading listings">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
          <div className="h-24 w-24 animate-pulse rounded-xl bg-zinc-100" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostFirstLink({ regionSlug }: { regionSlug: string }) {
  return (
    <Link href={`/${regionSlug}/post`} className="font-medium text-zinc-900 underline">
      post the first one
    </Link>
  );
}
