"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FavoriteStar, ListingImage, StatusTag, TimeAgo, VerifiedBadge } from "@/components/listing-bits";
import { CATEGORY_LABELS, hasCondition } from "@/lib/categories";
import { getSchoolName } from "@/lib/data";
import { deleteListing, flagListing, setListingStatus } from "@/lib/listing-actions";
import { formatListingPrice } from "@/lib/listings";
import { useGoToSignIn } from "@/lib/use-sign-in";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingNotFound({ regionSlug }: { regionSlug: string }) {
  return (
    <div className="mx-auto max-w-3xl px-3 py-8">
      <h1 className="text-xl font-bold">This posting has been deleted, sold or expired.</h1>
      <p className="mt-3">
        <Link href={`/${regionSlug}`}>back to {regionSlug}</Link>
      </p>
    </div>
  );
}

const FLAG_REASONS = [
  ["prohibited", "prohibited item or service"],
  ["scam", "scam or fraud"],
  ["spam", "spam or duplicate"],
  ["miscategorized", "wrong category"],
] as const;

export function ListingDetail({ listing, isOwner, signedIn }: { listing: Listing; isOwner: boolean; signedIn: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goToSignIn = useGoToSignIn();
  const here = `/${listing.regionSlug}/listing/${listing.id}`;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [replyOpen, setReplyOpen] = useState(searchParams.get("reply") === "1" && signedIn && !isOwner);
  const [replyNote, setReplyNote] = useState(false);
  const [message, setMessage] = useState(`Hi, is this still available? I'm interested in "${listing.title}".`);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagged, setFlagged] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const price = formatListingPrice(listing.priceCents, listing.category);

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

  async function flag(reason: string) {
    if (!signedIn) return goToSignIn(here);
    try {
      await flagListing(listing.id, reason);
      setFlagged("Thanks. This posting was flagged for review.");
    } catch {
      setFlagged("Couldn't flag this posting. Try again in a moment.");
    }
    setFlagOpen(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pt-3">
      {/* Action row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule pb-2 text-[13px]">
        {!isOwner && listing.status === "active" && (
          <button type="button" className="btn btn-primary" onClick={() => (signedIn ? setReplyOpen((o) => !o) : goToSignIn(`${here}?reply=1`))}>
            reply
          </button>
        )}
        <FavoriteStar listingId={listing.id} withLabel />
        {!isOwner && (
          <div className="relative">
            <button type="button" className="text-link" aria-expanded={flagOpen} onClick={() => (signedIn ? setFlagOpen((o) => !o) : goToSignIn(here))}>
              ⚑ flag
            </button>
            {flagOpen && (
              <ul className="absolute left-0 top-6 z-10 w-56 border border-rule bg-white py-1 shadow-md">
                {FLAG_REASONS.map(([value, label]) => (
                  <li key={value}>
                    <button type="button" className="block w-full px-3 py-1 text-left hover:bg-bar" onClick={() => flag(value)}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {flagged && (
          <span role="status" className="text-zinc-600">
            {flagged}
          </span>
        )}
      </div>

      {replyOpen && (
        <section className="mt-3 max-w-xl border border-rule bg-bar/40 p-3" aria-label="Reply to this posting">
          <h2 className="font-bold">reply to {listing.sellerName}</h2>
          {replyNote ? (
            <p className="mt-2 text-zinc-700">
              In-app messaging is the next feature being built, so nothing was sent yet. Your draft is kept below.
            </p>
          ) : null}
          <form
            className="mt-2 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              setReplyNote(true);
            }}
          >
            <label htmlFor="reply-message" className="sr-only">
              message
            </label>
            <textarea id="reply-message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full" />
            <button type="submit" className="btn">
              send
            </button>
          </form>
        </section>
      )}

      <h1 className="mt-3 text-[20px] leading-snug">
        <span className="font-bold">{listing.title}</span>
        {price && <span className="font-bold"> - {price}</span>}{" "}
        <span className="text-[15px] text-zinc-500">
          ({getSchoolName(listing.schoolId)} · {listing.area})
        </span>
        <StatusTag status={listing.status} />
      </h1>

      <div className="mt-3 grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <ListingImage listing={listing} src={listing.photos[photoIndex]} className="aspect-[4/3] w-full max-w-[640px] border border-rule" />
          {listing.photos.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Photos">
              {listing.photos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={i === photoIndex}
                  className={cn("h-14 w-14 overflow-hidden border-2", i === photoIndex ? "border-[#222]" : "border-transparent")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="mt-4 max-w-[640px] whitespace-pre-line text-[15px] leading-relaxed">{listing.description}</p>
          <p className="mt-6 text-[12px] text-zinc-500">
            post id: {listing.id.slice(0, 8)} · posted <TimeAgo iso={listing.postedAt} />
          </p>
        </div>

        <aside className="space-y-3 text-[13px]">
          <div className="border border-rule p-2.5">
            <dl className="space-y-1">
              <div>
                <dt className="inline text-zinc-500">category: </dt>
                <dd className="inline">
                  <Link href={`/${listing.regionSlug}/search?cat=${encodeURIComponent(listing.category)}`}>
                    {CATEGORY_LABELS[listing.category]}
                  </Link>
                </dd>
              </div>
              {hasCondition(listing.category) && (
                <div>
                  <dt className="inline text-zinc-500">condition: </dt>
                  <dd className="inline font-bold">{listing.condition}</dd>
                </div>
              )}
              <div>
                <dt className="inline text-zinc-500">campus: </dt>
                <dd className="inline">
                  <Link href={`/${listing.regionSlug}/search?school=${listing.schoolId}`}>{getSchoolName(listing.schoolId)}</Link>
                </dd>
              </div>
              <div>
                <dt className="inline text-zinc-500">pickup: </dt>
                <dd className="inline">{listing.area}</dd>
              </div>
              <div>
                <dt className="inline text-zinc-500">posted by: </dt>
                <dd className="inline">
                  {isOwner ? "you" : listing.sellerName} <VerifiedBadge domain={listing.sellerDomain} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="border border-rule bg-bar/40 p-2.5 text-zinc-700">
            <strong>safety:</strong> meet in a busy public place on campus and see the item before paying.{" "}
            <Link href="/about#safety">more tips</Link>
          </div>

          {isOwner && (
            <div className="space-y-2 border border-rule p-2.5">
              <h2 className="font-bold">manage your posting</h2>
              <div className="flex flex-wrap gap-2">
                {listing.status === "active" && (
                  <button type="button" className="btn" disabled={busy} onClick={() => ownerAction(() => setListingStatus(listing.id, "sold"))}>
                    mark as sold
                  </button>
                )}
                {listing.status === "sold" && (
                  <button type="button" className="btn" disabled={busy} onClick={() => ownerAction(() => setListingStatus(listing.id, "active"))}>
                    re-list
                  </button>
                )}
                <ConfirmDelete
                  busy={busy}
                  onConfirm={() =>
                    ownerAction(
                      () => deleteListing(listing.id),
                      () => {
                        router.replace(`/account?region=${listing.regionSlug}`);
                        router.refresh();
                      },
                    )
                  }
                />
              </div>
              {ownerError && (
                <p className="text-red-700" role="alert">
                  {ownerError}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function ConfirmDelete({ busy, onConfirm }: { busy: boolean; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="btn" disabled={busy} onClick={() => setAsking(true)}>
        delete
      </button>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <span className="text-red-700">delete posting and photos?</span>
      <button type="button" className="btn" disabled={busy} onClick={onConfirm}>
        yes, delete
      </button>
      <button type="button" className="text-link" onClick={() => setAsking(false)}>
        cancel
      </button>
    </span>
  );
}
