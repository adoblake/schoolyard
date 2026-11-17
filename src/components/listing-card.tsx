"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ListingImage, TimeAgo, VerifiedBadge } from "@/components/listing-bits";
import { getSchoolName } from "@/lib/data";
import { formatPrice } from "@/lib/listings";
import { useSaved } from "@/lib/local-store";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(listing.id);
  const href = `/${listing.regionSlug}/listing/${listing.id}`;

  return (
    <Card className="overflow-hidden rounded-2xl">
      <Link href={href} className="flex w-full gap-3 p-3 text-left hover:bg-zinc-50">
        <ListingImage listing={listing} className="h-24 w-24 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight">{listing.title}</h3>
            <span className="shrink-0 font-bold">{formatPrice(listing.priceCents)}</span>
          </div>
          <div className="mt-1 truncate text-xs text-zinc-500">
            {getSchoolName(listing.schoolId)} · {listing.area}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {listing.condition} · <TimeAgo iso={listing.postedAt} />
          </div>
          <VerifiedBadge domain={listing.sellerDomain} className="mt-2" />
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 text-sm">
        <Link href={`${href}?reply=1`} className="font-medium text-zinc-700 hover:underline">
          reply
        </Link>
        <button
          type="button"
          onClick={() => toggleSaved(listing.id)}
          aria-pressed={saved}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current text-rose-500")} aria-hidden />
          {saved ? "saved" : "save"}
        </button>
      </div>
    </Card>
  );
}
