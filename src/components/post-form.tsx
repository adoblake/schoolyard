"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import { getRegion } from "@/lib/data";
import { deleteListing } from "@/lib/listing-actions";
import { parsePriceToCents } from "@/lib/listings";
import { resizeImage } from "@/lib/resize-image";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { CATEGORIES, CONDITIONS, type Category, type Condition, type Listing } from "@/lib/types";

type Draft = {
  category: Category;
  title: string;
  price: string;
  condition: Condition;
  schoolId: string;
  area: string;
  description: string;
};

type Errors = Partial<Record<keyof Draft | "photos", string>>;

export const LIMITS = { title: 80, description: 2000, area: 60, photos: 6, photoBytes: 15 * 1024 * 1024 };

export function validateDraft(d: Draft): Errors {
  const errors: Errors = {};
  if (d.title.trim().length < 3) errors.title = "Give it a title (at least 3 characters).";
  if (d.category !== "free") {
    const cents = parsePriceToCents(d.price);
    if (cents === null) errors.price = "Enter a price like 25 or 25.50.";
    else if (cents > 10_000_00) errors.price = "Prices over $10,000 aren't allowed.";
  }
  if (!d.area.trim()) errors.area = "Where can people pick it up?";
  if (d.description.trim().length < 10) errors.description = "Add a few details (at least 10 characters).";
  return errors;
}

type Photo = { file: File; url: string };

export function PostForm({
  regionSlug,
  userId,
  sellerName,
  sellerDomain,
  defaultSchoolId,
}: {
  regionSlug: string;
  userId: string;
  sellerName: string;
  sellerDomain: string | null;
  defaultSchoolId: string | null;
}) {
  const region = getRegion(regionSlug)!;
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>({
    category: "books",
    title: "",
    price: "",
    condition: "good",
    schoolId:
      defaultSchoolId && region.schools.some((s) => s.id === defaultSchoolId) ? defaultSchoolId : region.schools[0].id,
    area: "",
    description: "",
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<Listing | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Free preview object URLs when photos are removed or the page goes away.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  });
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const accepted: Photo[] = [];
    let error: string | undefined;
    for (const file of Array.from(files)) {
      if (photos.length + accepted.length >= LIMITS.photos) {
        error = `Up to ${LIMITS.photos} photos.`;
        break;
      }
      if (!file.type.startsWith("image/")) {
        error = "Only photos can be added.";
        continue;
      }
      if (file.size > LIMITS.photoBytes) {
        error = "That photo is over 15 MB.";
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    setPhotos((p) => [...p, ...accepted]);
    setErrors((e) => ({ ...e, photos: error }));
  }

  function removePhoto(index: number) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[index].url);
      return p.filter((_, i) => i !== index);
    });
  }

  function buildPreview(): Listing {
    return {
      id: "preview",
      regionSlug: region.slug,
      schoolId: draft.schoolId,
      title: draft.title.trim(),
      priceCents: draft.category === "free" ? 0 : (parsePriceToCents(draft.price) ?? 0),
      category: draft.category,
      condition: draft.condition,
      area: draft.area.trim(),
      description: draft.description.trim(),
      sellerId: userId,
      sellerName,
      sellerDomain,
      postedAt: new Date().toISOString(),
      status: "active",
      photos: photos.map((p) => p.url),
    };
  }

  async function publish(listing: Listing) {
    const supabase = createClient();
    setSubmitError(null);
    setStatus("Posting…");

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: userId,
        region_slug: listing.regionSlug,
        school_id: listing.schoolId,
        title: listing.title,
        description: listing.description,
        price_cents: listing.priceCents,
        category: listing.category,
        condition: listing.condition,
        area: listing.area,
      })
      .select("id")
      .single();

    if (error || !data) {
      setStatus(null);
      setSubmitError(
        error?.code === "42501"
          ? "Your account isn't set up to post yet. Add your name and campus on the Account page."
          : `Couldn't post: ${error?.message ?? "unknown error"}`,
      );
      return;
    }

    const listingId = data.id;
    try {
      for (let i = 0; i < photos.length; i++) {
        setStatus(`Uploading photo ${i + 1} of ${photos.length}…`);
        const blob = await resizeImage(photos[i].file);
        const path = `${userId}/${listingId}/${i}.jpg`;
        const upload = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
        if (upload.error) throw new Error(upload.error.message);
        const row = await supabase.from("listing_photos").insert({ listing_id: listingId, storage_path: path, position: i });
        if (row.error) throw new Error(row.error.message);
      }
    } catch (e) {
      // Don't leave a half-posted listing behind.
      await deleteListing(listingId).catch(() => {});
      setStatus(null);
      setSubmitError(`Photo upload failed, so nothing was posted. ${e instanceof Error ? e.message : ""}`);
      return;
    }

    setStatus("Posted!");
    router.replace(`/${region.slug}/listing/${listingId}`);
    router.refresh();
  }

  if (preview) {
    return (
      <Shell title="preview" onBack={() => setPreview(null)} backLabel="edit">
        <p className="mb-3 text-sm text-zinc-500">This is how your post will look in {region.name}.</p>
        <div className="pointer-events-none">
          <ListingCard listing={preview} hideActions />
        </div>
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700">
          <p className="whitespace-pre-line">{preview.description}</p>
        </div>
        {submitError && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {submitError}
          </p>
        )}
        <Button className="mt-4 h-12 w-full rounded-2xl" disabled={!!status} onClick={() => publish(preview)}>
          {status ?? "post it"}
        </Button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Listings stay up for 30 days, or until you mark them sold.
        </p>
      </Shell>
    );
  }

  const isFree = draft.category === "free";
  const isWanted = draft.category === "wanted";

  return (
    <Shell
      title="new post"
      onBack={() => (window.history.length > 1 ? router.back() : router.push(`/${region.slug}`))}
      backLabel="cancel"
    >
      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="mb-1 font-bold">Simple posting</div>
        <p className="text-sm leading-6 text-zinc-500">
          Pick a category, add the basics, and post to students near your campus. Posting as{" "}
          <span className="font-medium text-zinc-900">{sellerName}</span>.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const found = validateDraft(draft);
          setErrors(found);
          if (Object.keys(found).length === 0) {
            setPreview(buildPreview());
            window.scrollTo(0, 0);
          } else {
            document.getElementById(`post-${Object.keys(found)[0]}`)?.focus();
          }
        }}
        className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4"
      >
        <Field label="category" id="post-category">
          <select
            id="post-category"
            value={draft.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </Field>

        <Field label="posting title" id="post-title" error={errors.title}>
          <input
            id="post-title"
            value={draft.title}
            maxLength={LIMITS.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={isWanted ? "ex: WANTED: TI-84 calculator" : "ex: TI-84 calculator"}
            className={inputClass}
            aria-invalid={!!errors.title}
          />
        </Field>

        {!isFree && (
          <Field label={isWanted ? "budget" : "price"} id="post-price" error={errors.price}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
              <input
                id="post-price"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0"
                className={`${inputClass} pl-7`}
                aria-invalid={!!errors.price}
              />
            </div>
          </Field>
        )}

        {!isWanted && draft.category !== "services" && (
          <Field label="condition" id="post-condition">
            <select
              id="post-condition"
              value={draft.condition}
              onChange={(e) => set("condition", e.target.value as Condition)}
              className={inputClass}
            >
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="campus" id="post-schoolId">
          <select
            id="post-schoolId"
            value={draft.schoolId}
            onChange={(e) => set("schoolId", e.target.value)}
            className={inputClass}
          >
            {region.schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="pickup spot" id="post-area" error={errors.area}>
          <input
            id="post-area"
            value={draft.area}
            maxLength={LIMITS.area}
            onChange={(e) => set("area", e.target.value)}
            placeholder="ex: near the library"
            className={inputClass}
            aria-invalid={!!errors.area}
          />
        </Field>

        <Field label="description" id="post-description" error={errors.description}>
          <textarea
            id="post-description"
            value={draft.description}
            maxLength={LIMITS.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="condition, pickup times, extra details"
            className={`${inputClass} h-28`}
            aria-invalid={!!errors.description}
          />
        </Field>

        <div>
          <span className="mb-1 block text-sm font-medium">
            photos <span className="font-normal text-zinc-400">(optional, up to {LIMITS.photos})</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={p.url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < LIMITS.photos && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 text-xs text-zinc-500 hover:bg-zinc-50"
              >
                <ImagePlus className="h-5 w-5" aria-hidden /> add
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            id="post-photos"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            aria-label="Add photos"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          {errors.photos && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.photos}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500">Photos are resized and location data is removed before upload.</p>
        </div>

        <Button type="submit" className="h-12 w-full rounded-2xl">
          preview post
        </Button>
      </form>
    </Shell>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm aria-[invalid=true]:border-red-500";

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Shell({
  title,
  onBack,
  backLabel,
  children,
}: {
  title: string;
  onBack: () => void;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-xl p-2 text-sm font-medium hover:bg-zinc-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden /> {backLabel}
          </button>
          <div className="text-sm font-bold">{title}</div>
          <div className="w-16" />
        </div>
      </div>
      <main className="mx-auto max-w-md px-4 py-4 pb-24">{children}</main>
    </div>
  );
}
