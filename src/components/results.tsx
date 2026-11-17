import Link from "next/link";
import { FavoriteStar, ListingImage, ShortDate, StatusTag } from "@/components/listing-bits";
import { getSchoolName } from "@/lib/data";
import { formatListingPrice } from "@/lib/listings";
import type { Listing } from "@/lib/types";

const href = (l: Listing) => `/${l.regionSlug}/listing/${l.id}`;

/** Craigslist-style list rows: star, date, title, price, campus, pic. */
export function ResultList({ listings, showStatus }: { listings: Listing[]; showStatus?: boolean }) {
  return (
    <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
      {listings.map((l) => {
        const price = formatListingPrice(l.priceCents, l.category);
        return (
          <li key={l.id} className="flex items-start gap-2 py-1.5">
            <FavoriteStar listingId={l.id} className="mt-0.5" />
            <span className="w-12 shrink-0 pt-px text-[13px] text-zinc-500">
              <ShortDate iso={l.postedAt} />
            </span>
            <span className="min-w-0 flex-1">
              <Link href={href(l)} className="text-[15px]">
                {l.title}
              </Link>
              {showStatus && <StatusTag status={l.status} />}{" "}
              {price && <span className="text-[14px] font-bold text-zinc-800">{price}</span>}{" "}
              <span className="text-[13px] text-zinc-500">
                ({getSchoolName(l.schoolId)} · {l.area})
              </span>
              {l.photos.length > 0 && <span className="ml-1 text-[12px] text-zinc-400">pic</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Gallery view: photo tiles with price and title. */
export function ResultGallery({ listings }: { listings: Listing[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l) => {
        const price = formatListingPrice(l.priceCents, l.category);
        return (
          <li key={l.id} className="relative border border-zinc-200">
            <Link href={href(l)} className="block">
              <ListingImage listing={l} className="aspect-[4/3] w-full" />
              {price && (
                <span className="absolute left-1 top-1 bg-black/75 px-1.5 text-[13px] font-bold text-white">{price}</span>
              )}
            </Link>
            <div className="flex items-start gap-1 p-1.5">
              <FavoriteStar listingId={l.id} />
              <div className="min-w-0">
                <Link href={href(l)} className="line-clamp-2 text-[14px] leading-snug">
                  {l.title}
                </Link>
                <div className="truncate text-[12px] text-zinc-500">
                  <ShortDate iso={l.postedAt} /> · {getSchoolName(l.schoolId)}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
