-- Hacktoberfest 2026 certificates (REIMAGINE Club, BBDITM Lucknow)
--
-- Private participant list + private certificate storage. Nothing here is readable
-- from the website directly: Row Level Security is on with no public policies, and
-- the storage bucket is private. Only the two Edge Functions (which run with the
-- service role) can read them, and they only ever return one person's certificate
-- for an exact listed name, or one holder for an exact certificate ID.

-- 1. Participants ---------------------------------------------------------------
create table if not exists public.hacktoberfest_participants (
  id                  bigint generated always as identity primary key,
  name                text        not null check (length(btrim(name)) > 1),
  -- lower-case, single-spaced form of the name, used for matching what people type
  name_key            text        generated always as (lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))) stored,
  team                text,
  certificate_id      text        not null unique check (certificate_id ~ '^HF26-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  revoked             boolean     not null default false,
  issued_at           timestamptz not null default now(),
  first_downloaded_at timestamptz,
  last_downloaded_at  timestamptz,
  download_count      integer     not null default 0,
  unique (name_key)
);

comment on table public.hacktoberfest_participants is
  'Hacktoberfest 2026 participants. One row per accepted spelling of a name; the certificate image is stored as <certificate_id>.jpg in the hacktoberfest-certificates bucket.';

alter table public.hacktoberfest_participants enable row level security;
-- No policies on purpose: the anon/public roles cannot read or change anything.
revoke all on public.hacktoberfest_participants from anon, authenticated;

-- 2. Rate limit: failed name lookups per visitor (stops someone guessing names) -----
create table if not exists public.hacktoberfest_lookups (
  id         bigint generated always as identity primary key,
  client     text        not null,
  created_at timestamptz not null default now()
);
create index if not exists hacktoberfest_lookups_client_time on public.hacktoberfest_lookups (client, created_at);
alter table public.hacktoberfest_lookups enable row level security;
revoke all on public.hacktoberfest_lookups from anon, authenticated;

-- 3. Private storage bucket for the finished certificates ---------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hacktoberfest-certificates', 'hacktoberfest-certificates', false, 5242880, array['image/jpeg'])
on conflict (id) do update set public = false;
-- No storage policies: files are only reachable through short-lived signed links
-- created by the get-certificate function.
