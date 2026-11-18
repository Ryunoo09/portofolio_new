-- 0001_init.sql — portfolio schema, read-only RLS, public media bucket
-- Run once in Supabase SQL Editor (or: psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql).

begin;

create extension if not exists "pgcrypto";

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text not null,
  tagline text,
  summary_short text,
  about_md text,
  location_text text,
  email_public text not null,
  avatar_path text,
  cv_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text,
  sort_order integer not null default 0
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  location text,
  start_date date not null,
  end_date date,
  bullets text[] not null default '{}',
  tech text[] not null default '{}',
  sort_order integer not null default 0,
  constraint experiences_dates_valid check (end_date is null or end_date >= start_date)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description_md text,
  role text,
  year integer,
  tech text[] not null default '{}',
  repo_url text,
  live_url text,
  is_private boolean not null default false,
  cover_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null,
  alt text not null,
  sort_order integer not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  icon text,
  sort_order integer not null default 0
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

create index if not exists projects_published_order_idx
  on public.projects (is_published, sort_order);
create index if not exists experiences_order_idx on public.experiences (sort_order);
create index if not exists skills_category_order_idx on public.skills (category, sort_order);
create index if not exists social_links_order_idx on public.social_links (sort_order);
create index if not exists project_media_project_order_idx
  on public.project_media (project_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Read-only at the grant level, then narrowed by RLS.
revoke all on table
  public.profile,
  public.social_links,
  public.experiences,
  public.projects,
  public.project_media,
  public.skills,
  public.site_settings
from anon, authenticated;

grant select on table
  public.profile,
  public.social_links,
  public.experiences,
  public.projects,
  public.project_media,
  public.skills,
  public.site_settings
to anon, authenticated;

alter table public.profile enable row level security;
alter table public.social_links enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.skills enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists profile_public_read on public.profile;
create policy profile_public_read on public.profile for select to anon, authenticated using (true);

drop policy if exists social_links_public_read on public.social_links;
create policy social_links_public_read on public.social_links for select to anon, authenticated using (true);

drop policy if exists experiences_public_read on public.experiences;
create policy experiences_public_read on public.experiences for select to anon, authenticated using (true);

drop policy if exists skills_public_read on public.skills;
create policy skills_public_read on public.skills for select to anon, authenticated using (true);

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (true);

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select to anon, authenticated using (is_published);

drop policy if exists project_media_public_read on public.project_media;
create policy project_media_public_read on public.project_media
  for select to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_media.project_id and p.is_published
  ));

-- Public read bucket for images, CV, and audio. Writes happen with the service role only.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

commit;
