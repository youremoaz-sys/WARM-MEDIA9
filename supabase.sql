-- WARM MEDIA: Supabase database foundation
-- Run this in Supabase SQL Editor.
-- This creates structured tables. The current separated front-end files retain
-- the original localStorage behavior until Supabase credentials and auth are configured.

create extension if not exists pgcrypto;

create table if not exists public.wm_articles (
  id bigint primary key,
  title text not null,
  category integer not null default 0 check (category between 0 and 5),
  author text not null default '',
  body text not null default '',
  image_data text not null default '',
  is_breaking boolean not null default false,
  created_at bigint not null
);

create index if not exists wm_articles_created_at_idx
  on public.wm_articles (created_at desc);

create table if not exists public.wm_comments (
  id bigint primary key,
  parent_id bigint,
  username text not null default 'Guest',
  content text not null check (char_length(content) between 1 and 300),
  likes integer not null default 0 check (likes >= 0),
  is_featured boolean not null default false,
  created_at bigint not null
);

create index if not exists wm_comments_created_at_idx
  on public.wm_comments (created_at desc);

create table if not exists public.wm_settings (
  id integer primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Admin identities must be explicitly added by the project owner.
create table if not exists public.wm_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.wm_articles enable row level security;
alter table public.wm_comments enable row level security;
alter table public.wm_settings enable row level security;
alter table public.wm_admins enable row level security;

-- Public website may read published news, comments and visual settings.
drop policy if exists "Public can read articles" on public.wm_articles;
create policy "Public can read articles"
  on public.wm_articles for select to anon, authenticated using (true);

drop policy if exists "Public can read comments" on public.wm_comments;
create policy "Public can read comments"
  on public.wm_comments for select to anon, authenticated using (true);

drop policy if exists "Public can read settings" on public.wm_settings;
create policy "Public can read settings"
  on public.wm_settings for select to anon, authenticated using (true);

-- Only registered admin identities can manage news, comments and settings.
drop policy if exists "Admins manage articles" on public.wm_articles;
create policy "Admins manage articles"
  on public.wm_articles for all to authenticated
  using (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage comments" on public.wm_comments;
create policy "Admins manage comments"
  on public.wm_comments for all to authenticated
  using (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage settings" on public.wm_settings;
create policy "Admins manage settings"
  on public.wm_settings for all to authenticated
  using (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.wm_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can read admin list" on public.wm_admins;
create policy "Admins can read admin list"
  on public.wm_admins for select to authenticated
  using (user_id = auth.uid());

-- Public comment submission is intentionally handled by a server-side RPC
-- in the next integration step, rather than granting anonymous UPDATE/DELETE.
