-- Policy helpers don't need to be callable over the REST API. Moving them out of
-- the exposed "public" schema keeps them usable by RLS policies (which reference
-- them by OID) while removing /rest/v1/rpc access.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.is_verified_student() set schema private;
alter function public.is_blocked_between(uuid, uuid) set schema private;
alter function public.is_conversation_participant(uuid) set schema private;

revoke execute on function private.is_verified_student() from public, anon;
revoke execute on function private.is_blocked_between(uuid, uuid) from public, anon;
revoke execute on function private.is_conversation_participant(uuid) from public, anon;
grant execute on function private.is_verified_student() to authenticated;
grant execute on function private.is_blocked_between(uuid, uuid) to authenticated;
grant execute on function private.is_conversation_participant(uuid) to authenticated;
