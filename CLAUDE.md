@AGENTS.md

# SchoolYard

Student marketplace with school-email sign-in, listings with photos, browse/search and saved listings.
Next.js 16 + Supabase (Postgres RLS, Auth, Storage).

## Run
- `npm install`, then `npm run dev` (port 3000). It uses the SchoolYard Supabase project by default; `.env.local` overrides that.

## Verify (same as CI)
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`
- UI changes: run `verify-ui`.

## Ship
- Vercel deploys the default branch (currently `claude/trusting-lamport-7tjtib`, so PRs target it) to https://schoolyard-chi.vercel.app/.
- Schema changes: add a new timestamped file in `supabase/migrations/`, never edit an applied one, and apply it before merging code that needs it.

## Gotchas
- Next 16 renamed middleware to `src/proxy.ts`, which refreshes the Supabase session cookie.
- Supabase's built-in email only reaches project members. Real students need custom SMTP (a dashboard setting, not code).
- `tester_emails` grants test access. It must be emptied before launch.
