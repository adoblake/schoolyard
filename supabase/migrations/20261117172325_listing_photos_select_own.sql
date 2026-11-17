-- Storage's remove() also needs SELECT on the objects being deleted. Public
-- reads go through the public bucket URL, so this only covers API access to
-- the user's own folder.
create policy "users read own photo objects" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
