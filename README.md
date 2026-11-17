# SchoolYard

Student classifieds that look and work like classic city classifieds (plain
text, blue links, dense category directory), organized around the colleges
nearby: pick a SchoolYard (`phoenix.schoolyard`, `tucson.schoolyard`, …), browse
by section, category and campus, and buy, sell or trade with verified students.

**Live:** <https://schoolyard-chi.vercel.app/> (deploys automatically from this repo's default branch)

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 | App scaffold, prototype ported, prototype bugs fixed | ✅ done |
| 1 | Supabase: school-email sign-in, real posting with photos, real browse/search, saved listings | ✅ done |
| 2 | In-app messaging + notifications | next |
| Launch prep | Landing page, For Schools page, request-your-campus form, draft Terms & Privacy, share image, sitemap | ✅ done |
| Classifieds redesign | Craigslist-style look and flow, more categories, list/gallery search with paging, flagging | ✅ done |
| 3 | Report/block/moderation tools, final legal review, custom domain | |

### What works now

- **Sites page** (`/`) lists every SchoolYard city; **city home** (`/phoenix`) is a
  directory: for sale, housing, services and community sections with their
  categories, plus campuses, search and help links.
- **Search** (`/phoenix/search`): list or gallery view, sort by newest or price,
  sidebar filters (category or whole section, campus, price range, has image,
  posted today), 60 results per page with prev/next. Prefix full-text search,
  so "calc" finds "calculator". Plain GET form, so it works without JavaScript.
- **Create a posting** in steps: posting type → category → details → preview →
  publish. Price means rent/month for housing and rate for services; community
  posts have no price; condition only shows for items for sale. Up to 6 images,
  resized and stripped of location data in the browser.
- **Posting page**: title line with price and campus, images, attributes box,
  reply, ☆ favorite, ⚑ flag (prohibited, scam, spam, wrong category → `reports`
  table), and manage controls for the seller (mark sold, re-list, delete).
- **Log in with a school email** (emailed link, no password). Non-school emails
  are refused up front and by the database.
- **Account**: postings table with status, plus settings (name, campus) and log out.
- **Favorites** stored per account.
- **About, safety tips, For Schools, request-your-campus form, draft Terms and Privacy.**
- **Reply** still says messaging isn't live yet instead of pretending to send.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui-style components, lucide icons
- [Supabase](https://supabase.com): Postgres + row-level security, Auth (email
  links), Storage (`listing-photos` bucket). Project `yyrbpxpkvlkefpkaooxg`.
- Vitest for unit tests

## Getting started

```bash
npm install
npm run dev                  # http://localhost:3000
```

The app talks to the SchoolYard Supabase project by default. To point it at a
different project, copy `.env.example` to `.env.local` and change the values.

## Put it online (Vercel, about 5 minutes)

1. Go to <https://vercel.com/new>, sign in with GitHub, and import `adoblake/schoolyard`.
2. Leave every setting at its default and click **Deploy**. No environment
   variables are needed. You'll get a URL like `https://schoolyard-xxxx.vercel.app`.
3. In Supabase, open **Authentication → URL Configuration**: set **Site URL** to
   that URL and add `https://<that-url>/auth/confirm` to **Redirect URLs**.
4. When you buy a domain, add it in Vercel (**Settings → Domains**), repeat step 3
   with it, and set `NEXT_PUBLIC_SITE_URL` to it in Vercel so share previews use it.

Every push to `main` redeploys automatically.

Other scripts: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

## Launch checklist

Browsing works for anyone as soon as it's deployed. Before inviting students:

- [x] Deploy (live at https://schoolyard-chi.vercel.app/)
- [ ] Set the Supabase URL configuration for that address
- [ ] Custom SMTP so sign-in emails reach students (below)
- [ ] Confirm each school's student email domain (below)
- [ ] Add a contact email to `/privacy` and have Terms & Privacy reviewed
- [ ] Empty `tester_emails`
- [ ] Seed a few real listings yourself so the first visitors don't see an empty board

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
    [region]/page.tsx              city home: directory of sections and categories
    [region]/search/page.tsx       search results (list/gallery, filters, paging)
    [region]/listing/[id]/page.tsx listing detail
    [region]/post/page.tsx         new post (verified students only)
    [region]/saved/page.tsx        favorites
    account/page.tsx               profile, sign out, my listings
    login/page.tsx                 school-email sign-in
    auth/confirm/route.ts          where the email link lands
    page.tsx                       sites page (all cities)
    about/page.tsx                 about, safety tips, request your campus
    schools/page.tsx               pitch for colleges and universities
    terms/, privacy/               draft legal pages
  components/                      screens and shared UI
  lib/
    data.ts                        regions + schools (must match the DB seed)
    categories.ts                  sections, category labels, price/condition rules
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
- Flags go to `reports` (review them in the table editor). Deleting a reported
  listing keeps the report, pointed at the seller with the listing title.
- Messaging and block tables and rules are in place for the next phases.

After changing the schema, regenerate `src/lib/supabase/database.types.ts`.

## Known limitations

- Browse shows the newest 40 matches; there's no "load more" yet.
- An unknown region (e.g. `/nowhere`) shows the not-found page with HTTP 200,
  because the page shell is streamed before the region is checked.
