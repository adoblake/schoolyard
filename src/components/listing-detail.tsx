"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, CircleCheck, Mail, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/sheet";
import { SaveButton, StatusBadge } from "@/components/listing-card";
import { ListingImage, TimeAgo, VerifiedBadge } from "@/components/listing-bits";
import { getSchoolName } from "@/lib/data";
import { deleteListing, setListingStatus } from "@/lib/listing-actions";
import { formatPrice } from "@/lib/listings";
import { useGoToSignIn } from "@/lib/use-sign-in";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingNotFound({ regionSlug }: { regionSlug: string }) {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 text-center text-zinc-950">
      <h1 className="text-lg font-bold">Listing not found</h1>
      <p className="mt-2 text-sm text-zinc-500">It may have been sold, expired or removed.</p>
      <Button asChild className="mt-6 rounded-2xl">
        <Link href={`/${regionSlug}`}>Back to listings</Link>
      </Button>
    </div>
  );
}

export function ListingDetail({
  listing,
  isOwner,
  signedIn,
}: {
  listing: Listing;
  isOwner: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goToSignIn = useGoToSignIn();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [replyOpen, setReplyOpen] = useState(searchParams.get("reply") === "1" && signedIn && !isOwner);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(`Hi, is this still available? I'm interested in the ${listing.title}.`);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(`/${listing.regionSlug}`);
  }

  function ownerAction(fn: () => Promise<void>, after?: () => void) {
    setOwnerError(null);
    startTransition(async () => {
      try {
        await fn();
        if (after) after();
        else router.refresh();
      } catch (e) {
        setOwnerError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

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
          <SaveButton listingId={listing.id} iconOnly className="rounded-xl p-2 text-zinc-900 hover:bg-zinc-100" />
        </div>
      </div>

      <main className="mx-auto max-w-md pb-28">
        <ListingImage listing={listing} src={listing.photos[photoIndex]} className="h-72 w-full" />
        {listing.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-white px-4 pt-3" role="group" aria-label="Photos">
            {listing.photos.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setPhotoIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-pressed={i === photoIndex}
                className={cn(
                  "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                  i === photoIndex ? "border-zinc-900" : "border-transparent",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <section className="bg-white px-4 py-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-2xl font-bold">{formatPrice(listing.priceCents)}</span>
            <StatusBadge status={listing.status} />
          </div>
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
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {listing.sellerDomain} verified
                </div>
              ) : (
                <VerifiedBadge domain={null} className="mt-1" />
              )}
            </div>
            <div className="text-right text-xs text-zinc-500">{isOwner ? "you" : "campus member"}</div>
          </div>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Meet in a busy public spot on campus, and don&apos;t pay before you&apos;ve seen the item.
          </p>
        </section>

        {isOwner && (
          <section className="mt-3 space-y-2 bg-white px-4 py-4">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-zinc-500">your listing</h2>
            {listing.status === "active" && (
              <Button
                className="w-full rounded-2xl"
                disabled={busy}
                onClick={() => ownerAction(() => setListingStatus(listing.id, "sold"))}
              >
                <CircleCheck className="h-4 w-4" aria-hidden /> mark as sold
              </Button>
            )}
            {listing.status === "sold" && (
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                disabled={busy}
                onClick={() => ownerAction(() => setListingStatus(listing.id, "active"))}
              >
                put it back on sale
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full rounded-2xl text-red-600"
              disabled={busy}
              onClick={() => {
                if (!window.confirm("Delete this listing and its photos? This can't be undone.")) return;
                ownerAction(
                  () => deleteListing(listing.id),
                  () => {
                    router.replace(`/account?region=${listing.regionSlug}`);
                    router.refresh();
                  },
                );
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden /> delete listing
            </Button>
            {ownerError && (
              <p className="text-sm text-red-600" role="alert">
                {ownerError}
              </p>
            )}
          </section>
        )}
      </main>

      {!isOwner && listing.status === "active" && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white p-4">
          <div className="mx-auto flex max-w-md gap-2">
            <Button
              onClick={() =>
                signedIn
                  ? setReplyOpen(true)
                  : goToSignIn(`/${listing.regionSlug}/listing/${listing.id}?reply=1`)
              }
              className="h-12 flex-1 rounded-2xl text-base"
            >
              <Mail className="h-5 w-5" aria-hidden /> reply
            </Button>
            <SaveButton
              listingId={listing.id}
              className="h-12 justify-center rounded-2xl border border-zinc-200 bg-white px-5 font-medium text-zinc-900 hover:bg-zinc-100"
            />
          </div>
        </div>
      )}

      <Sheet
        open={replyOpen}
        onClose={() => {
          setReplyOpen(false);
          setSent(false);
        }}
        title={sent ? "Not sent yet" : "Reply to seller"}
        description={sent ? undefined : `Message ${listing.sellerName} about this listing`}
      >
        {sent ? (
          <div className="text-sm leading-6 text-zinc-600">
            In-app messaging is the next thing being built (Phase 2), so nothing was sent. Your draft is kept if
            you reopen this.
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
              value={message}
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
