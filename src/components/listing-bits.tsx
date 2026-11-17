"use client";

import {
  Armchair,
  BookOpen,
  Gift,
  Home,
  Laptop,
  PencilRuler,
  Search,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/listings";
import { useNow } from "@/lib/client-store";
import type { Category, Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  books: BookOpen,
  furniture: Armchair,
  electronics: Laptop,
  supplies: PencilRuler,
  free: Gift,
  wanted: Search,
  services: Wrench,
  "dorm/apartment": Home,
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
      // Plain <img>: uploads are already resized in the browser before upload,
      // so there's little to gain from Next's image optimizer for now.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={listing.title}
        loading="lazy"
        className={cn("bg-zinc-100 object-cover", className)}
      />
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

export function VerifiedBadge({ domain, className }: { domain: string | null; className?: string }) {
  if (!domain) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800",
          className,
        )}
      >
        not verified
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600",
        className,
      )}
      title={`Verified ${domain} email`}
    >
      <ShieldCheck className="h-3 w-3" aria-hidden /> {domain}
    </span>
  );
}
