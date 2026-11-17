-- A report must name a listing or a user when it's filed, but later deletions
-- (listing removed, account deleted) may clear both. Enforce the rule in the
-- insert policy instead of a table check, so account deletion isn't blocked.
alter table public.reports drop constraint reports_check;

drop policy "users file reports" on public.reports;
create policy "users file reports" on public.reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'open'
    and (listing_id is not null or reported_user_id is not null)
  );
