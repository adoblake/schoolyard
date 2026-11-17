-- Deleting a reported listing failed: reports.listing_id is set to null on
-- delete, which broke the rule that a report must point at a listing or a user.
-- Before a listing is deleted, point its reports at the seller and keep the
-- title, so moderators keep the evidence and sellers can still delete.
alter table public.reports add column listing_title text;

create function public.preserve_reports_on_listing_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reports
  set reported_user_id = coalesce(reported_user_id, old.seller_id),
      listing_title = coalesce(listing_title, old.title)
  where listing_id = old.id;
  return old;
end;
$$;

revoke execute on function public.preserve_reports_on_listing_delete() from public, anon, authenticated;

create trigger listings_preserve_reports
  before delete on public.listings
  for each row execute function public.preserve_reports_on_listing_delete();
