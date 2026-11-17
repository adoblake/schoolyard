# SchoolYard

Student classifieds, organized like city classifieds but around the colleges
nearby: pick a SchoolYard (`phoenix.schoolyard`, `tucson.schoolyard`, …), filter
by campus and category, and buy, sell or trade with other verified students.

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 | App scaffold, prototype ported, prototype bugs fixed | ✅ done |
| 1 | Supabase: school-email sign-in, real posting with photos, real browse/search, saved listings | ✅ done |
| 2 | In-app messaging + notifications | next |
| 3 | Report/block/moderation tools, Terms & Privacy, deploy + domain | |

### What works now

- **Sign in with a school email** (emailed link, no password). Non-school emails
  are refused up front and by the database. New users add the name buyers see
  and pick their campus (an `asu.edu` user picks Tempe or Downtown).
- **Posting**: category, price, condition, campus, pickup spot, description and up
  to 6 photos. Photos are resized in the browser (max 1600px) and their
  EXIF/location data is stripped before upload. Listings expire after 30 days.
- **Browse** per region, with college, category, full-text search (prefix
  matching, so "calc" finds "calculator"), price range and sort. Filters live in
  the URL, so links are shareable.
- **Listing page** with photo gallery. Sellers can mark sold, put back on sale,
  or delete (photos are deleted too).
- **Saved listings** stored per account.
- **Account page**: edit name/campus, sign out, see your listings.
- **Reply** still says messaging isn't live (Phase 2) instead of pretending to send.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui-style components, lucide icons
- [Supabase](https://supabase.com): Postgres + row-level security, Auth (email
  links), Storage (`listing-photos` bucket). Project `yyrbpxpkvlkefpkaooxg`.
- Vitest for unit tests

## Getting started

```bash
npm install
cp .env.example .env.local   # public Supabase URL + publishable key
npm run dev                  # http://localhost:3000 → /phoenix
```

Other scripts: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

## Before real students can sign in

These are Supabase dashboard settings (Authentication section), not code:

1. **Custom SMTP (required).** Supabase's built-in email only delivers to members
   of your Supabase organization and is limited to a few emails per hour. Set up
   an email provider (e.g. Resend, Postmark) under *Authentication → Emails → SMTP*.
2. **URL configuration.** *Site URL* defaults to `http://localhost:3000`, which is
   right for local development. When you deploy, set it to the real domain and
   add `https://<your-domain>/auth/confirm` to *Redirect URLs*.
3. **Verify school email domains** in
   `supabase/migrations/20261117170039_seed_reference_data.sql` with each school.

### Testing sign-in yourself before that

Sign-up only accepts school emails. To let a specific non-school address in
for testing (say your own email, which the built-in mailer *will* deliver to
because you're on the Supabase project), add it to the tester list in the
Supabase SQL editor; it then counts as a verified student of that domain:

```sql
insert into public.tester_emails (email, domain, note)
values ('you@example.com', 'asu.edu', 'owner testing');
```

Empty `tester_emails` before launch. The table isn't reachable through the API.

## Project layout

```
src/
  proxy.ts                         refreshes the Supabase session cookie
  app/
    [region]/page.tsx              browse (server-rendered results)
    [region]/listing/[id]/page.tsx listing detail
    [region]/post/page.tsx         new post (verified students only)
    [region]/saved/page.tsx        saved listings
    account/page.tsx               profile, sign out, my listings
    login/page.tsx                 school-email sign-in
    auth/confirm/route.ts          where the email link lands
  components/                      screens and shared UI
  lib/
    data.ts                        regions + schools (must match the DB seed)
    listings.ts                    URL filters, search query, price/time formatting (+ tests)
    queries.ts                     server-side Supabase reads
    client-store.ts                signed-in user, saved ids, clock (browser)
    listing-actions.ts             seller actions (mark sold, delete)
    supabase/                      clients, env, generated database types
supabase/migrations/               schema, storage, reference data — all applied
```

## Database

Migrations in `supabase/migrations/` match what's applied to the project. Key rules
(all enforced by Postgres, not just the UI):

- Sign-up is refused unless the email is a listed school domain (subdomains
  count, e.g. `my.gcu.edu` → `gcu.edu`) or on `tester_emails`.
- `verified_domain` is set at sign-up and can't be edited; users can only pick a
  campus their domain covers.
- Only verified students with a name and campus can post; sellers can only
  change their own listings and upload into their own photo folder.
- Active, unexpired listings are public; sold/expired ones are visible only to
  their seller.
- Messaging/blocks/reports tables and rules are in place for Phases 2–3.

After changing the schema, regenerate `src/lib/supabase/database.types.ts`.

## Known limitations

- Browse shows the newest 40 matches; there's no "load more" yet.
- An unknown region (e.g. `/nowhere`) shows the not-found page with HTTP 200,
  because the page shell is streamed before the region is checked.
