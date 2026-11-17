"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import { getRegion } from "@/lib/data";
import { parsePriceToCents } from "@/lib/listings";
import { addLocalListing } from "@/lib/local-store";
import { CATEGORIES, CONDITIONS, type Category, type Condition, type Listing } from "@/lib/types";

type Draft = {
  category: Category;
  title: string;
  price: string;
  condition: Condition;
  schoolId: string;
  area: string;
  description: string;
  sellerName: string;
};

type Errors = Partial<Record<keyof Draft, string>>;

export const LIMITS = { title: 80, description: 2000, area: 60, sellerName: 40 };

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
  if (!d.sellerName.trim()) errors.sellerName = "Add the name buyers will see.";
  return errors;
}

export function PostForm({ regionSlug }: { regionSlug: string }) {
  const region = getRegion(regionSlug)!;
  const router = useRouter();
  const emptyDraft = (): Draft => ({
    category: "books",
    title: "",
    price: "",
    condition: "good",
    schoolId: region.schools[0].id,
    area: "",
    description: "",
    sellerName: "",
  });
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<Listing | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function buildListing(): Listing {
    return {
      id: `local-${crypto.randomUUID()}`,
      regionSlug: region.slug,
      schoolId: draft.schoolId,
      title: draft.title.trim(),
      priceCents: draft.category === "free" ? 0 : (parsePriceToCents(draft.price) ?? 0),
      category: draft.category,
      condition: draft.condition,
      area: draft.area.trim(),
      description: draft.description.trim(),
      sellerName: draft.sellerName.trim(),
      sellerDomain: "",
      postedAt: new Date().toISOString(),
      origin: "local",
    };
  }

  if (preview) {
    return (
      <Shell title="preview" onBack={() => setPreview(null)} backLabel="edit">
        <p className="mb-3 text-sm text-zinc-500">This is how your post will look in {region.name}.</p>
        <div className="pointer-events-none">
          <ListingCard listing={preview} />
        </div>
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700">
          <p className="whitespace-pre-line">{preview.description}</p>
        </div>
        <Button
          className="mt-4 h-12 w-full rounded-2xl"
          onClick={() => {
            const listing = { ...preview, postedAt: new Date().toISOString() };
            addLocalListing(listing);
            // Next keeps this page mounted after navigating away; start fresh next time.
            setPreview(null);
            setDraft(emptyDraft());
            router.replace(`/${region.slug}/listing/${listing.id}`);
          }}
        >
          post it
        </Button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Demo build: your post is saved in this browser only.
        </p>
      </Shell>
    );
  }

  const isFree = draft.category === "free";
  const isWanted = draft.category === "wanted";

  return (
    <Shell title="new post" onBack={() => (window.history.length > 1 ? router.back() : router.push(`/${region.slug}`))}
      backLabel="cancel">
      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="mb-1 font-bold">Simple posting</div>
        <p className="text-sm leading-6 text-zinc-500">
          Pick a category, add the basics, and post to students near your campus.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const found = validateDraft(draft);
          setErrors(found);
          if (Object.keys(found).length === 0) {
            setPreview(buildListing());
            window.scrollTo(0, 0);
          } else {
            const first = Object.keys(found)[0];
            document.getElementById(`post-${first}`)?.focus();
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

        <Field label="your name (as buyers will see it)" id="post-sellerName" error={errors.sellerName}>
          <input
            id="post-sellerName"
            value={draft.sellerName}
            maxLength={LIMITS.sellerName}
            onChange={(e) => set("sellerName", e.target.value)}
            placeholder="ex: Maya R."
            autoComplete="given-name"
            className={inputClass}
            aria-invalid={!!errors.sellerName}
          />
        </Field>

        <p className="text-xs leading-5 text-zinc-500">
          Photos and school-email verification arrive with accounts in Phase 1.
        </p>

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

function Shell({
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
