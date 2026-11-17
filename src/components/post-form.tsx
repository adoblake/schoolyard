"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ResultList } from "@/components/results";
import { CATEGORY_LABELS, PRICE_LABELS, SECTIONS, getSection, hasCondition, priceKind } from "@/lib/categories";
import { getRegion, getSchoolName } from "@/lib/data";
import { deleteListing } from "@/lib/listing-actions";
import { formatListingPrice, parsePriceToCents } from "@/lib/listings";
import { resizeImage } from "@/lib/resize-image";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/supabase/env";
import { CONDITIONS, type Category, type Condition, type Listing } from "@/lib/types";

type Draft = {
  title: string;
  price: string;
  condition: Condition;
  schoolId: string;
  area: string;
  description: string;
};

type Errors = Partial<Record<keyof Draft | "photos", string>>;

export const LIMITS = { title: 80, description: 2000, area: 60, photos: 6, photoBytes: 15 * 1024 * 1024 };

export function validateDraft(d: Draft, category: Category): Errors {
  const errors: Errors = {};
  if (d.title.trim().length < 3) errors.title = "Add a posting title (at least 3 characters).";
  if (priceKind(category) !== null) {
    const cents = parsePriceToCents(d.price);
    if (cents === null) errors.price = "Enter an amount like 25 or 25.50.";
    else if (cents > 10_000_00) errors.price = "Amounts over $10,000 aren't allowed.";
  }
  if (!d.area.trim()) errors.area = "Where can people meet you or pick it up?";
  if (d.description.trim().length < 10) errors.description = "Add a few details (at least 10 characters).";
  return errors;
}

type Photo = { file: File; url: string };
type Step = "type" | "category" | "details" | "preview";

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
  const [step, setStep] = useState<Step>("type");
  const [sectionId, setSectionId] = useState<string>("");
  const [category, setCategory] = useState<Category | "">("");
  const [draft, setDraft] = useState<Draft>({
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
  const [status, setStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        error = `Up to ${LIMITS.photos} images.`;
        break;
      }
      if (!file.type.startsWith("image/")) {
        error = "Only images can be added.";
        continue;
      }
      if (file.size > LIMITS.photoBytes) {
        error = "That image is over 15 MB.";
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

  const cat = category || "books";
  const kind = priceKind(cat);
  const preview: Listing = {
    id: "preview",
    regionSlug: region.slug,
    schoolId: draft.schoolId,
    title: draft.title.trim(),
    priceCents: kind === null ? 0 : (parsePriceToCents(draft.price) ?? 0),
    category: cat,
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

  async function publish() {
    const supabase = createClient();
    setSubmitError(null);
    setStatus("publishing…");

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: userId,
        region_slug: preview.regionSlug,
        school_id: preview.schoolId,
        title: preview.title,
        description: preview.description,
        price_cents: preview.priceCents,
        category: preview.category,
        condition: hasCondition(preview.category) ? preview.condition : "good",
        area: preview.area,
      })
      .select("id")
      .single();

    if (error || !data) {
      setStatus(null);
      setSubmitError(
        error?.code === "42501"
          ? "Your account isn't set up to post yet. Add your name and campus on your account page."
          : `Couldn't publish: ${error?.message ?? "unknown error"}`,
      );
      return;
    }

    const listingId = data.id;
    try {
      for (let i = 0; i < photos.length; i++) {
        setStatus(`uploading image ${i + 1} of ${photos.length}…`);
        const blob = await resizeImage(photos[i].file);
        const path = `${userId}/${listingId}/${i}.jpg`;
        const upload = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
        if (upload.error) throw new Error(upload.error.message);
        const row = await supabase.from("listing_photos").insert({ listing_id: listingId, storage_path: path, position: i });
        if (row.error) throw new Error(row.error.message);
      }
    } catch (e) {
      await deleteListing(listingId).catch(() => {});
      setStatus(null);
      setSubmitError(`Image upload failed, so nothing was published. ${e instanceof Error ? e.message : ""}`);
      return;
    }

    setStatus("published");
    router.replace(`/${region.slug}/listing/${listingId}`);
    router.refresh();
  }

  const stepNames: Step[] = ["type", "category", "details", "preview"];

  return (
    <main className="mx-auto max-w-3xl px-3 pt-3">
      <ol className="mb-4 flex flex-wrap gap-x-3 text-[13px] text-zinc-500" aria-label="Steps">
        {stepNames.map((s, i) => (
          <li key={s} className={s === step ? "font-bold text-[#222]" : ""} aria-current={s === step ? "step" : undefined}>
            {i + 1}. {s === "type" ? "posting type" : s}
          </li>
        ))}
      </ol>

      {step === "type" && (
        <fieldset className="border border-rule p-3">
          <legend className="px-1 font-bold">what type of posting is this?</legend>
          <ul className="space-y-1.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="post-type"
                    value={s.id}
                    checked={sectionId === s.id}
                    onChange={() => {
                      setSectionId(s.id);
                      setCategory("");
                      setStep("category");
                    }}
                  />
                  {s.label}
                  <span className="text-[12px] text-zinc-500">
                    ({s.categories.map((c) => CATEGORY_LABELS[c]).slice(0, 4).join(", ")}
                    {s.categories.length > 4 ? ", …" : ""})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {step === "category" && (
        <fieldset className="border border-rule p-3">
          <legend className="px-1 font-bold">choose the category that fits best</legend>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {(getSection(sectionId)?.categories ?? []).map((c) => (
              <li key={c}>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="post-category"
                    value={c}
                    checked={category === c}
                    onChange={() => {
                      setCategory(c);
                      setStep("details");
                    }}
                  />
                  {CATEGORY_LABELS[c]}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px]">
            <button type="button" className="text-link" onClick={() => setStep("type")}>
              « back
            </button>
          </p>
        </fieldset>
      )}

      {step === "details" && category && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const found = validateDraft(draft, category);
            setErrors(found);
            if (Object.keys(found).length === 0) {
              setStep("preview");
              window.scrollTo(0, 0);
            } else {
              document.getElementById(`post-${Object.keys(found)[0]}`)?.focus();
            }
          }}
          className="space-y-3 border border-rule p-3"
        >
          <p className="text-[13px] text-zinc-600">
            posting in <strong>{region.label}</strong> &gt; {getSection(sectionId)?.label} &gt;{" "}
            <strong>{CATEGORY_LABELS[category]}</strong>{" "}
            <button type="button" className="text-link" onClick={() => setStep("category")}>
              (change)
            </button>
          </p>

          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <Field label="posting title" id="post-title" error={errors.title}>
              <input
                id="post-title"
                value={draft.title}
                maxLength={LIMITS.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full"
                aria-invalid={!!errors.title}
              />
            </Field>
            {kind !== null && (
              <Field label={PRICE_LABELS[kind]} id="post-price" error={errors.price}>
                <input
                  id="post-price"
                  inputMode="decimal"
                  value={draft.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="$"
                  className="w-full"
                  aria-invalid={!!errors.price}
                />
              </Field>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="campus" id="post-schoolId">
              <select id="post-schoolId" value={draft.schoolId} onChange={(e) => set("schoolId", e.target.value)} className="w-full">
                {region.schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="meeting / pickup spot" id="post-area" error={errors.area}>
              <input
                id="post-area"
                value={draft.area}
                maxLength={LIMITS.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="near the library"
                className="w-full"
                aria-invalid={!!errors.area}
              />
            </Field>
          </div>

          {hasCondition(category) && (
            <Field label="condition" id="post-condition">
              <select id="post-condition" value={draft.condition} onChange={(e) => set("condition", e.target.value as Condition)}>
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="description" id="post-description" error={errors.description}>
            <textarea
              id="post-description"
              rows={8}
              value={draft.description}
              maxLength={LIMITS.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full"
              aria-invalid={!!errors.description}
            />
          </Field>

          <div>
            <span className="mb-1 block font-bold">
              images <span className="font-normal text-zinc-500">(optional, up to {LIMITS.photos})</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p.url} className="relative h-20 w-20 border border-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove image ${i + 1}`}
                    className="absolute right-0 top-0 bg-black/70 px-1 text-[12px] text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {photos.length < LIMITS.photos && (
              <button type="button" className="btn mt-2" onClick={() => fileInput.current?.click()}>
                add images
              </button>
            )}
            <input
              ref={fileInput}
              id="post-photos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label="Add images"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            {errors.photos && (
              <p className="mt-1 text-[13px] text-red-700" role="alert">
                {errors.photos}
              </p>
            )}
            <p className="mt-1 text-[12px] text-zinc-500">Images are resized and location data is removed before upload.</p>
          </div>

          <p className="text-[13px] text-zinc-600">
            Posting as <strong>{sellerName}</strong>. Replies come to your SchoolYard account. By posting you agree to the{" "}
            <a href="/terms" target="_blank" rel="noreferrer">
              terms of use
            </a>
            .
          </p>

          <button type="submit" className="btn btn-primary">
            continue
          </button>
        </form>
      )}

      {step === "preview" && category && (
        <div className="space-y-3">
          <p className="border border-rule bg-bar/40 p-2 text-[13px]">This is how your posting will look. Publish it, or go back to edit.</p>
          <div className="pointer-events-none" aria-hidden>
            <ResultList listings={[preview]} />
          </div>
          <div className="border border-rule p-3">
            <h2 className="text-[18px]">
              <strong>{preview.title}</strong>
              {formatListingPrice(preview.priceCents, preview.category) && (
                <strong> - {formatListingPrice(preview.priceCents, preview.category)}</strong>
              )}{" "}
              <span className="text-[14px] text-zinc-500">
                ({getSchoolName(preview.schoolId)} · {preview.area})
              </span>
            </h2>
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.url} src={p.url} alt={`Image ${i + 1}`} className="h-20 w-20 border border-rule object-cover" />
                ))}
              </div>
            )}
            <p className="mt-2 whitespace-pre-line">{preview.description}</p>
          </div>
          {submitError && (
            <p className="border border-red-300 bg-red-50 p-2 text-red-800" role="alert">
              {submitError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-primary" disabled={!!status} onClick={publish}>
              {status ?? "publish"}
            </button>
            <button type="button" className="text-link" disabled={!!status} onClick={() => setStep("details")}>
              edit
            </button>
          </div>
          <p className="text-[12px] text-zinc-500">Postings stay up for 30 days, or until you mark them sold.</p>
        </div>
      )}
    </main>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
