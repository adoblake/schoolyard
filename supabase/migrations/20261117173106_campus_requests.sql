-- "Bring SchoolYard to my campus" requests from the public landing page.
-- Anyone can submit; nobody can read through the API (owners read them in the
-- dashboard / SQL editor). Used to decide where to launch next.
create table public.campus_requests (
  id          uuid primary key default gen_random_uuid(),
  school_name text not null check (char_length(btrim(school_name)) between 2 and 120),
  city        text check (char_length(city) <= 80),
  state       text check (char_length(state) <= 40),
  role        text not null default 'student' check (role in ('student', 'staff', 'parent', 'other')),
  email       text check (email is null or (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  created_at  timestamptz not null default now()
);
create index campus_requests_created_idx on public.campus_requests (created_at desc);

alter table public.campus_requests enable row level security;

create policy "anyone can request a campus" on public.campus_requests
  for insert to anon, authenticated
  with check (true);

-- Insert-only through the API.
revoke select, update, delete on public.campus_requests from anon, authenticated;
