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
import { useNow } from "@/lib/local-store";
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
export function ListingImage({ listing, className }: { listing: Listing; className?: string }) {
  if (listing.imageUrl) {
    return (
      // Plain <img> for now: photos come from arbitrary hosts until uploads
      // move to Supabase Storage in Phase 1, then this can become next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={listing.imageUrl}
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

export function VerifiedBadge({ domain, className }: { domain: string; className?: string }) {
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
      title="School email verification arrives in Phase 1"
    >
      <ShieldCheck className="h-3 w-3" aria-hidden /> {domain}
    </span>
  );
}

export function DemoBanner() {
  return (
    <p className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Demo build: listings are samples, and anything you post or save stays in this browser only.
    </p>
  );
}
