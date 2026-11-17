# SchoolYard

Student classifieds, organized like city classifieds but around the colleges
nearby: pick a SchoolYard (`phoenix.schoolyard`, `tucson.schoolyard`, …), filter
by campus and category, and buy, sell or trade with other students.

## Status: Phase 0 (working prototype)

This is the original single-file prototype ported into a real Next.js app.
**There is no backend yet.** Listings are demo data, and anything you post or
save is kept in your browser's localStorage only.

| Phase | Scope | Status |
|---|---|---|
| 0 | App scaffold, prototype ported, prototype bugs fixed, draft DB schema | ✅ this branch |
| 1 | Supabase: school-email sign-in, real posting with photos, real browse/search | next |
| 2 | In-app messaging + notifications, saved listings, my listings, profile | |
| 3 | Report/block/moderation tools, Terms & Privacy, deploy + domain | |

### What changed from the prototype

- **Region filtering works.** Choosing Tucson no longer shows Phoenix listings.
- **Real URLs**: `/phoenix`, `/phoenix/listing/<id>`, `/phoenix/post`, `/phoenix/saved`.
  Filters live in the query string (`/phoenix?school=gcu&cat=books&q=lamp`), so
  they survive going to a listing and back, reloading, and sharing a link.
- **Posting works end to end** (form validation, preview, post, delete your own
  post). The campus list comes from the selected region instead of a fixed list.
- **Save/heart** works everywhere and persists; there's a Saved page.
- **Menu**, **price & sort** filter, and **search** across title, description,
  pickup spot, category and school.
- Prices are stored as integer cents; times are real timestamps.
- Listings without photos show a category icon instead of a broken image.
- "Reply" opens the message sheet, but says plainly that messaging isn't live
  yet (Phase 2) rather than pretending to send.
- Sellers who haven't verified a school email are labelled "not verified".

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui-style components (`src/components/ui`), lucide icons
- Vitest for unit tests
- Planned: Supabase (Postgres, Auth, Storage, Realtime), hosted on Vercel

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /phoenix
```

Other scripts:

```bash
npm test             # unit tests (filtering, price parsing, time formatting)
npm run lint
npm run typecheck
npm run build
```

## Project layout

```
src/
  app/
    page.tsx                       → redirects to the default region
    [region]/page.tsx              browse
    [region]/listing/[id]/page.tsx listing detail + reply sheet
    [region]/post/page.tsx         new post form
    [region]/saved/page.tsx        saved listings
  components/                      screens and shared UI
  lib/
    types.ts                       Listing, Region, categories, conditions
    data.ts                        regions, schools, demo listings
    listings.ts                    filtering, sorting, price/time formatting (+ tests)
    local-store.ts                 Phase 0 stand-in for the backend (localStorage)
supabase/
  migrations/                      DRAFT schema for Phase 1 (not applied anywhere yet)
  seed.sql                         regions, schools, school email domains
```

`src/lib/local-store.ts` is the only place that knows data lives in the
browser; Phase 1 swaps it for Supabase queries without touching the screens.

## Database schema (draft)

`supabase/migrations/20261117000000_initial_schema.sql` sets up regions,
schools, school email domains, profiles, listings (+ photos, full-text search),
saved listings, conversations/messages, blocks and reports, with row-level
security on every table. It has been run against a local Postgres 16 with a
stubbed Supabase `auth` schema to check the rules, but **not** applied to a
Supabase project yet. Key rules:

- A profile is created on sign-up; its `verified_domain` comes from the email
  (subdomains count, e.g. `my.gcu.edu` → `gcu.edu`) and users can't edit it.
- One domain can cover several campuses (`asu.edu`, `maricopa.edu`), so users
  pick their campus from the ones their domain covers.
- Only verified students with a campus can post or start conversations.
- Messages are visible only to the two participants; blocking stops new messages.
- Reports are write-only for users (moderators read them with the service role).

Before Phase 1: **verify each school's student email domain** in `supabase/seed.sql`,
and add a Supabase Auth "before user created" hook so non-school emails can't
sign up at all.

## Known limitations (Phase 0)

- No accounts, verification, photo uploads or messaging yet (see phases above).
- Demo listing photos are hot-linked from Unsplash.
- An unknown region (e.g. `/nowhere`) shows the not-found page but returns
  HTTP 200, because the page shell is streamed before the region is checked.
