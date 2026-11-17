-- SchoolYard initial schema. Targets Supabase Postgres (auth schema, anon /
-- authenticated roles). Row-level security is on for every table.

-- ---------------------------------------------------------------------------
-- Reference data: regions, schools, and the email domains that verify them
-- ---------------------------------------------------------------------------

create table public.regions (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  label       text not null,             -- "phoenix.schoolyard"
  name        text not null,             -- "Phoenix SchoolYard"
  subtitle    text not null,
  sort_order  int  not null default 0
);

create table public.schools (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  region_slug text not null references public.regions (slug),
  name        text not null,
  sort_order  int  not null default 0
);
create index schools_region_idx on public.schools (region_slug);

-- One domain can cover several campuses (e.g. a community-college district),
-- so a verified user picks their campus from the schools matching their domain.
create table public.school_email_domains (
  domain     text not null check (domain = lower(domain)),
  school_id  text not null references public.schools (id) on delete cascade,
  primary key (domain, school_id)
);

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text not null default '' check (char_length(display_name) <= 40),
  school_id        text references public.schools (id),
  -- The school email domain this user proved they own (set by trigger, not by the user).
  verified_domain  text,
  created_at       timestamptz not null default now()
);

-- Returns the school_email_domains.domain that an email belongs to, matching
-- subdomains too (student@my.gcu.edu → gcu.edu), or null.
create function public.matching_school_domain(email text)
returns text
language sql
stable
set search_path = ''
as $$
  select d.domain
  from public.school_email_domains d
  where lower(split_part(email, '@', 2)) = d.domain
     or lower(split_part(email, '@', 2)) like '%.' || d.domain
  order by length(d.domain) desc
  limit 1;
$$;

-- Individual addresses allowed to sign up without a school email, treated as
-- verified for the given school domain. For testing before launch: manage it
-- from the dashboard / SQL editor only (no API access), and empty it before launch.
create table public.tester_emails (
  email   text primary key check (email = lower(email)),
  domain  text not null,
  note    text
);

-- Resolves the school domain an email signs up under (school domain or tester entry).
create function public.signup_domain(email text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.matching_school_domain($1),
    (select t.domain from public.tester_emails t where t.email = lower($1))
  );
$$;

-- Lets the sign-in form tell people up front whether their email can join.
create function public.email_is_eligible(email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.signup_domain($1) is not null;
$$;

-- Create a profile whenever someone signs up, and refuse sign-ups from
-- addresses that aren't a school email (or on the tester list).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain text := public.signup_domain(new.email);
  v_school text;
begin
  if v_domain is null then
    raise exception 'SchoolYard sign-up needs a school email address (got %)', split_part(new.email, '@', 2)
      using errcode = 'check_violation';
  end if;

  -- Pre-select the campus when the domain maps to exactly one school.
  select min(school_id) into v_school
  from public.school_email_domains
  where domain = v_domain
  having count(*) = 1;

  insert into public.profiles (id, verified_domain, school_id)
  values (new.id, v_domain, v_school);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may change their display name and campus, but only to a campus their
-- verified domain covers. verified_domain itself is not user-editable.
create function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.verified_domain is distinct from old.verified_domain
     and current_user in ('authenticated', 'anon') then
    raise exception 'verified_domain cannot be changed';
  end if;
  if new.school_id is not null and not exists (
    select 1 from public.school_email_domains
    where domain = new.verified_domain and school_id = new.school_id
  ) then
    raise exception 'school % is not covered by your verified email domain', new.school_id;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- True when the current user has a verified school email and has picked a campus.
create function public.is_verified_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and verified_domain is not null
      and school_id is not null
      and display_name <> ''
  );
$$;

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

create type public.listing_category as enum
  ('books', 'furniture', 'electronics', 'supplies', 'free', 'wanted', 'services', 'dorm/apartment');

create type public.listing_condition as enum
  ('new', 'like new', 'good', 'fair', 'for parts');

create type public.listing_status as enum
  ('active', 'sold', 'expired', 'removed');

create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.profiles (id) on delete cascade,
  region_slug  text not null references public.regions (slug),
  school_id    text not null references public.schools (id),
  title        text not null check (char_length(title) between 3 and 80),
  description  text not null check (char_length(description) between 10 and 2000),
  price_cents  int  not null check (price_cents between 0 and 1000000),
  category     public.listing_category not null,
  condition    public.listing_condition not null default 'good',
  area         text not null check (char_length(area) between 1 and 60),
  status       public.listing_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '30 days',
  search       tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(area, '')), 'C')
  ) stored,
  constraint free_listings_cost_nothing check (category <> 'free' or price_cents = 0)
);

create index listings_browse_idx on public.listings (region_slug, status, created_at desc);
create index listings_school_idx on public.listings (school_id, status, created_at desc);
create index listings_seller_idx on public.listings (seller_id);
create index listings_search_idx on public.listings using gin (search);

-- A listing's school must belong to its region.
create function public.check_listing_school_region()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.schools where id = new.school_id and region_slug = new.region_slug
  ) then
    raise exception 'school % is not in region %', new.school_id, new.region_slug;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_check_school_region
  before insert or update on public.listings
  for each row execute function public.check_listing_school_region();

create table public.listing_photos (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings (id) on delete cascade,
  storage_path  text not null,           -- path inside the "listing-photos" storage bucket
  position      smallint not null default 0 check (position between 0 and 7),
  created_at    timestamptz not null default now(),
  unique (listing_id, position)
);

create table public.saved_listings (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  listing_id  uuid not null references public.listings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index saved_listings_listing_idx on public.saved_listings (listing_id);

-- ---------------------------------------------------------------------------
-- Messaging (Phase 2)
-- ---------------------------------------------------------------------------

create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  buyer_id    uuid not null references public.profiles (id) on delete cascade,
  seller_id   uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index conversations_buyer_idx on public.conversations (buyer_id);
create index conversations_seller_idx on public.conversations (seller_id);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid not null references public.profiles (id) on delete cascade,
  body             text not null check (char_length(body) between 1 and 2000),
  created_at       timestamptz not null default now(),
  read_at          timestamptz
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Trust & safety (Phase 3)
-- ---------------------------------------------------------------------------

create table public.blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

create type public.report_status as enum ('open', 'actioned', 'dismissed');

create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles (id) on delete cascade,
  listing_id        uuid references public.listings (id) on delete set null,
  reported_user_id  uuid references public.profiles (id) on delete set null,
  reason            text not null check (char_length(reason) between 1 and 60),
  details           text check (char_length(details) <= 2000),
  status            public.report_status not null default 'open',
  created_at        timestamptz not null default now(),
  check (listing_id is not null or reported_user_id is not null)
);
create index reports_status_idx on public.reports (status, created_at);

-- Either user has blocked the other. Only answers for the caller's own
-- relationships, so it can't be used to probe who blocked whom.
create function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.uid()) in (a, b), false) and exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Participant check used by messages policies; security definer so it can
-- read conversations without recursing through their own RLS.
create function public.is_conversation_participant(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations
    where id = conv and (select auth.uid()) in (buyer_id, seller_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.regions               enable row level security;
alter table public.schools               enable row level security;
alter table public.school_email_domains  enable row level security;
alter table public.tester_emails         enable row level security;  -- no policies: not reachable via the API
alter table public.profiles              enable row level security;
alter table public.listings              enable row level security;
alter table public.listing_photos        enable row level security;
alter table public.saved_listings        enable row level security;
alter table public.conversations         enable row level security;
alter table public.messages              enable row level security;
alter table public.blocks                enable row level security;
alter table public.reports               enable row level security;

-- Reference data is public and read-only.
create policy "regions are public" on public.regions for select to anon, authenticated using (true);
create policy "schools are public" on public.schools for select to anon, authenticated using (true);
create policy "domains are public" on public.school_email_domains for select to anon, authenticated using (true);

-- Profiles: anyone can see the public fields (name, campus) shown on listings.
create policy "profiles are public" on public.profiles
  for select to anon, authenticated using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Listings: active ones are public; sellers also see their own sold/expired ones.
create policy "active listings are public" on public.listings
  for select to anon, authenticated
  using (status = 'active' and expires_at > now());
create policy "sellers see own listings" on public.listings
  for select to authenticated
  using (seller_id = (select auth.uid()));
create policy "verified students create listings" on public.listings
  for insert to authenticated
  with check (seller_id = (select auth.uid()) and status = 'active' and public.is_verified_student());
create policy "sellers update own listings" on public.listings
  for update to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()) and status <> 'removed');
create policy "sellers delete own listings" on public.listings
  for delete to authenticated
  using (seller_id = (select auth.uid()));

-- Photos follow their listing's visibility (the listings policies above apply in the subquery).
create policy "photos visible with listing" on public.listing_photos
  for select to anon, authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "sellers manage own photos" on public.listing_photos
  for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())));

create policy "users manage own saved listings" on public.saved_listings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Conversations: only the two participants; a buyer starts one about an active
-- listing that isn't theirs, with the listing's real seller, if neither blocked the other.
create policy "participants read conversations" on public.conversations
  for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy "verified buyers start conversations" on public.conversations
  for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and public.is_verified_student()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = conversations.seller_id and l.status = 'active'
    )
    and not public.is_blocked_between(buyer_id, seller_id)
  );

create policy "participants read messages" on public.messages
  for select to authenticated
  using (public.is_conversation_participant(conversation_id));
create policy "participants send messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id)
    and not exists (
      select 1 from public.conversations c
      where c.id = conversation_id and public.is_blocked_between(c.buyer_id, c.seller_id)
    )
  );
-- Marking messages read is done through a security-definer RPC in Phase 2,
-- so there is deliberately no update policy here.

create policy "users manage own blocks" on public.blocks
  for all to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

-- Reports are write-only for users; moderators read them with the service role.
create policy "users file reports" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open');
create policy "users see own reports" on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()));

-- Lock down helper functions: only what policies/clients need is callable.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_update() from public, anon, authenticated;
revoke execute on function public.check_listing_school_region() from public, anon, authenticated;
revoke execute on function public.signup_domain(text) from public, anon, authenticated;
grant execute on function public.email_is_eligible(text) to anon, authenticated;
