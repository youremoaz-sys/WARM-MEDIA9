-- Warm Media platform extension
-- Run after database/schema.sql.

create type if not exists public.reaction_kind as enum ('like','love');
create type if not exists public.ad_place as enum (
  'home_top','home_mid','sidebar','section','reward_badge','reward_comments'
);

alter table public.profiles
  add column if not exists gender text check (gender in ('male','female','private')),
  add column if not exists bio text check (char_length(coalesce(bio,'')) <= 500),
  add column if not exists anonymous_name text,
  add column if not exists is_verified_badge boolean not null default false,
  add column if not exists can_custom_avatar boolean not null default false,
  add column if not exists comment_count_visible integer not null default 5,
  add column if not exists may_comment boolean not null default true,
  add column if not exists banned_until timestamptz;

alter table public.categories
  add column if not exists icon text,
  add column if not exists color text,
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists advertising_value numeric(12,2);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text,
  body text not null check (char_length(body) between 1 and 5000),
  image_url text,
  link_url text,
  is_pinned boolean not null default false,
  is_published boolean not null default true,
  status public.content_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.news_reactions (
  news_id uuid not null references public.news(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (news_id, user_id)
);

create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  news_id uuid not null references public.news(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, news_id)
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  link_url text,
  place public.ad_place not null,
  category_id uuid references public.categories(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  max_impressions integer,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ad_events (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('impression','click','reward_verified','comment_unlock')),
  provider_token text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_kind text not null default 'platform_reward',
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  source text not null default 'reward',
  provider_token text,
  primary key (user_id, badge_kind)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  browser_push boolean not null default false,
  news_alerts boolean not null default true,
  comment_alerts boolean not null default true,
  admin_alerts boolean not null default true
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.news_reactions enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.ads enable row level security;
alter table public.ad_events enable row level security;
alter table public.user_badges enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "active categories public read" on public.categories;
create policy "active categories public read" on public.categories for select
  using (is_active = true or public.has_permission('news.manage'));

create policy "published posts read" on public.posts for select
  using (is_published and status='visible' or public.has_permission('news.manage'));
create policy "admin manage posts" on public.posts for all to authenticated
  using (public.has_permission('news.manage'))
  with check (public.has_permission('news.manage'));

create policy "post reactions read" on public.post_reactions for select using (true);
create policy "post reactions self insert" on public.post_reactions for insert to authenticated
  with check (user_id=auth.uid());
create policy "post reactions self delete" on public.post_reactions for delete to authenticated
  using (user_id=auth.uid());

create policy "news reactions read" on public.news_reactions for select using (true);
create policy "news reactions self insert" on public.news_reactions for insert to authenticated
  with check (user_id=auth.uid());
create policy "news reactions self delete" on public.news_reactions for delete to authenticated
  using (user_id=auth.uid());

create policy "comment reactions read" on public.comment_reactions for select using (true);
create policy "comment reactions self insert" on public.comment_reactions for insert to authenticated
  with check (user_id=auth.uid());
create policy "comment reactions self delete" on public.comment_reactions for delete to authenticated
  using (user_id=auth.uid());

create policy "bookmarks own read" on public.bookmarks for select to authenticated using (user_id=auth.uid());
create policy "bookmarks own insert" on public.bookmarks for insert to authenticated with check (user_id=auth.uid());
create policy "bookmarks own delete" on public.bookmarks for delete to authenticated using (user_id=auth.uid());

create policy "ads public read" on public.ads for select
  using (is_active and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now()));
create policy "staff manage ads" on public.ads for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

create policy "ad events insert" on public.ad_events for insert to authenticated
  with check (user_id is null or user_id=auth.uid());
create policy "staff read ad events" on public.ad_events for select to authenticated
  using (public.has_permission('settings.manage'));

create policy "badge public read" on public.user_badges for select using (true);
create policy "staff manage badges" on public.user_badges for all to authenticated
  using (public.has_permission('users.manage'))
  with check (public.has_permission('users.manage'));

create policy "notification preferences own" on public.notification_preferences for all to authenticated
  using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "push subscriptions own" on public.push_subscriptions for all to authenticated
  using (user_id=auth.uid()) with check (user_id=auth.uid());

create or replace function public.verify_reward_badge(provider_token text)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
begin
  if auth.uid() is null or nullif(trim(provider_token),'') is null then
    return false;
  end;
  if exists (
    select 1 from public.ad_events
    where event_type='reward_verified'
      and provider_token=verify_reward_badge.provider_token
  ) then
    return false;
  end;
  insert into public.ad_events(ad_id,user_id,event_type,provider_token)
  values (
    (select id from public.ads where place='reward_badge' and is_active=true order by created_at desc limit 1),
    auth.uid(),'reward_verified',provider_token
  );
  insert into public.user_badges(user_id,badge_kind,source,provider_token)
  values(auth.uid(),'platform_reward','ad_provider',provider_token)
  on conflict (user_id,badge_kind) do nothing;
  update public.profiles set is_verified_badge=true where id=auth.uid();
  return true;
end;
$$;
