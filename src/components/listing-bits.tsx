"use client";

import { useSyncExternalStore } from "react";
import {
  Armchair,
  Bike,
  BookOpen,
  BookUser,
  Gift,
  Home,
  Laptop,
  PencilRuler,
  Search,
  Shirt,
  SearchCheck,
  Ticket,
  Users,
  Wrench,
  GraduationCap,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/listings";
import { useNow, useSaved } from "@/lib/client-store";
import { useGoToSignIn } from "@/lib/use-sign-in";
import type { Category, Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  books: BookOpen,
  electronics: Laptop,
  furniture: Armchair,
  "dorm/apartment": Home,
  supplies: PencilRuler,
  clothing: Shirt,
  bikes: Bike,
  tickets: Ticket,
  free: Gift,
  wanted: Search,
  sublets: KeyRound,
  roommates: Users,
  tutoring: GraduationCap,
  services: Wrench,
  lost_found: SearchCheck,
  study_groups: BookUser,
};

/** Listing photo, or a category icon tile when the listing has no photo. */
export function ListingImage({
  listing,
  className,
  src = listing.photos[0],
}: {
  listing: Pick<Listing, "title" | "category" | "photos">;
  className?: string;
  src?: string;
}) {
  if (src) {
    return (
      // Uploads are already resized in the browser, so a plain <img> is fine.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={listing.title} loading="lazy" className={cn("bg-zinc-100 object-cover", className)} />
    );
  }
  const Icon = CATEGORY_ICONS[listing.category];
  return (
    <div
      role="img"
      aria-label={`${listing.category}, no photo`}
      className={cn("flex items-center justify-center bg-zinc-100 text-zinc-400", className)}
    >
      <Icon className="h-1/3 w-1/3 max-h-16 max-w-16" strokeWidth={1.5} />
    </div>
  );
}

export function TimeAgo({ iso }: { iso: string }) {
  const now = useNow();
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {now === null ? "recently" : formatTimeAgo(iso, now)}
    </time>
  );
}

const noop = () => () => {};

/** "Nov 17", in the viewer's time zone once in the browser. */
export function ShortDate({ iso }: { iso: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const date = new Date(iso);
  const text = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: hydrated ? undefined : "UTC",
  });
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}

/** "asu.edu verified" tag, or "not verified". */
export function VerifiedBadge({ domain, className }: { domain: string | null; className?: string }) {
  return (
    <span className={cn("text-[12px]", domain ? "text-green-800" : "text-amber-800", className)}>
      {domain ? `✓ ${domain} verified` : "not verified"}
    </span>
  );
}

/** Star toggle for favorites. Signed-out visitors are sent to log in. */
export function FavoriteStar({ listingId, withLabel, className }: { listingId: string; withLabel?: boolean; className?: string }) {
  const { isSaved, toggleSaved } = useSaved();
  const goToSignIn = useGoToSignIn();
  const saved = isSaved(listingId);
  return (
    <button
      type="button"
      onClick={async () => {
        if (!(await toggleSaved(listingId))) goToSignIn();
      }}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? "Remove from favorites" : "Add to favorites"}
      title={saved ? "Remove from favorites" : "Add to favorites"}
      className={cn("inline-flex items-center gap-1 leading-none", saved ? "text-[#e0a800]" : "text-zinc-400 hover:text-zinc-700", className)}
    >
      <span aria-hidden className="text-[16px]">
        {saved ? "★" : "☆"}
      </span>
      {withLabel && <span className="text-[13px] text-link">{saved ? "favorited" : "favorite"}</span>}
    </button>
  );
}

export function StatusTag({ status }: { status: Listing["status"] }) {
  if (status === "active") return null;
  return <span className="ml-1 bg-zinc-700 px-1 text-[11px] font-bold uppercase text-white">{status}</span>;
}
