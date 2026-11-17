"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CircleCheck, ChevronLeft, Heart, Mail, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { ListingImage, TimeAgo, VerifiedBadge } from "@/components/listing-bits";
import { getSchoolName } from "@/lib/data";
import { formatPrice } from "@/lib/listings";
import { deleteLocalListing, useHydrated, useListing, useSaved } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export function ListingDetail({ regionSlug, id }: { regionSlug: string; id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listing = useListing(id);
  const hydrated = useHydrated();
  const { isSaved, toggleSaved } = useSaved();
  const [replyOpen, setReplyOpen] = useState(searchParams.get("reply") === "1");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function goBack() {
    // Return to the filtered browse view if we came from it; otherwise go to the region home.
    if (window.history.length > 1) router.back();
    else router.push(`/${regionSlug}`);
  }

  // Listings posted from this browser only exist client-side; don't flash "not found" before hydration.
  if (!listing && !hydrated) return <div className="min-h-screen bg-zinc-50" />;

  if (!listing || listing.regionSlug !== regionSlug) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-16 text-center text-zinc-950">
        <h1 className="text-lg font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-zinc-500">It may have been sold or removed.</p>
        <Button asChild className="mt-6 rounded-2xl">
          <Link href={`/${regionSlug}`}>Back to listings</Link>
        </Button>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const isOwn = listing.origin === "local";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-1 rounded-xl p-2 text-sm font-medium hover:bg-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden /> back
          </button>
          <div className="text-sm font-bold">listing</div>
          <button
            type="button"
            onClick={() => toggleSaved(listing.id)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save listing"}
            className="rounded-xl p-2 hover:bg-zinc-100"
          >
            <Heart className={cn("h-5 w-5", saved && "fill-current text-rose-500")} />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-md pb-28">
        <ListingImage listing={listing} className="h-72 w-full" />

        <section className="bg-white px-4 py-4">
          <div className="mb-1 text-2xl font-bold">{formatPrice(listing.priceCents)}</div>
          <h1 className="text-xl font-semibold leading-tight">{listing.title}</h1>
          <div className="mt-2 flex items-center gap-1 text-sm text-zinc-500">
            <MapPin className="h-4 w-4" aria-hidden /> {getSchoolName(listing.schoolId)} · {listing.area}
          </div>
          <div className="mt-2 text-sm text-zinc-500">
            posted <TimeAgo iso={listing.postedAt} /> · condition: {listing.condition} · {listing.category}
          </div>
        </section>

        <section className="mt-3 bg-white px-4 py-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">description</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">{listing.description}</p>
        </section>

        <section className="mt-3 bg-white px-4 py-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">seller</h2>
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3">
            <div>
              <div className="font-semibold">{listing.sellerName}</div>
              {listing.sellerDomain ? (
                <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {listing.sellerDomain}
                </div>
              ) : (
                <VerifiedBadge domain="" className="mt-1" />
              )}
            </div>
            <div className="text-right text-xs text-zinc-500">{isOwn ? "you" : "campus member"}</div>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Meet in a busy public spot on campus, and don&apos;t pay before you&apos;ve seen the item.
          </p>
        </section>

        {isOwn && (
          <section className="mt-3 bg-white px-4 py-4">
            <Button
              variant="outline"
              className="w-full rounded-2xl text-red-600"
              onClick={() => {
                if (window.confirm("Delete this listing?")) {
                  deleteLocalListing(listing.id);
                  router.replace(`/${regionSlug}`);
                }
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden /> delete listing
            </Button>
          </section>
        )}
      </main>

      {!isOwn && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white p-4">
          <div className="mx-auto flex max-w-md gap-2">
            <Button onClick={() => setReplyOpen(true)} className="h-12 flex-1 rounded-2xl text-base">
              <Mail className="h-5 w-5" aria-hidden /> reply
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleSaved(listing.id)}
              aria-pressed={saved}
              className="h-12 rounded-2xl px-5"
            >
              {saved ? "saved" : "save"}
            </Button>
          </div>
        </div>
      )}

      <Sheet
        open={replyOpen}
        onClose={() => {
          setReplyOpen(false);
          setSent(false);
        }}
        title={sent ? "Message ready" : "Reply to seller"}
        description={sent ? undefined : `Message ${listing.sellerName} about this listing`}
      >
        {sent ? (
          <div className="text-sm leading-6 text-zinc-600">
            <CircleCheck className="mb-2 h-8 w-8 text-emerald-600" aria-hidden />
            In-app messaging isn&apos;t live yet (it&apos;s coming in Phase 2), so nothing was sent.
            Your draft is kept if you reopen this.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label htmlFor="reply-message" className="sr-only">
              Message
            </label>
            <textarea
              id="reply-message"
              required
              value={message ?? `Hi, is this still available? I'm interested in the ${listing.title}.`}
              onChange={(e) => setMessage(e.target.value)}
              className="h-28 w-full rounded-2xl border border-zinc-200 p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <Button type="submit" className="mt-3 h-12 w-full rounded-2xl">
              send message
            </Button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
