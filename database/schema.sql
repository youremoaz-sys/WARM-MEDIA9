-- Warm Media PostgreSQL / Supabase schema
-- Run in Supabase SQL Editor. Review policies before production launch.
create extension if not exists pgcrypto;

create type public.news_status as enum ('draft','published','archived');
create type public.report_status as enum ('open','reviewing','resolved','dismissed');
create type public.report_target as enum ('user','news','comment','message');
create type public.content_status as enum ('visible','hidden','removed');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 1 and 60),
 avatar_url text,
 avatar_kind text check (avatar_kind in ('default_a','default_b','custom')),
 is_disabled boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.roles(id smallserial primary key, name text unique not null check(name in ('super_admin','admin','moderator','member')));
insert into public.roles(name) values ('super_admin'),('admin'),('moderator'),('member') on conflict do nothing;
create table public.permissions(id smallserial primary key, code text unique not null, description text);
insert into public.permissions(code,description) values
('news.manage','Create, edit and publish news'),('users.manage','Manage user profiles and access'),
('reports.review','Review abuse reports'),('chat.moderate','Moderate chat messages'),
('admins.manage','Manage staff roles'),('settings.manage','Manage platform settings')
on conflict do nothing;
create table public.role_permissions(role_id smallint references roles(id) on delete cascade, permission_id smallint references permissions(id) on delete cascade, primary key(role_id,permission_id));
insert into role_permissions(role_id,permission_id)
select r.id,p.id from roles r cross join permissions p
where (r.name='super_admin')
or (r.name='admin' and p.code in ('news.manage','users.manage','reports.review','chat.moderate'))
or (r.name='moderator' and p.code in ('reports.review','chat.moderate'))
on conflict do nothing;
create table public.user_roles(user_id uuid references auth.users(id) on delete cascade, role_id smallint references roles(id) on delete cascade, assigned_by uuid references auth.users(id), assigned_at timestamptz default now(), primary key(user_id,role_id));
create table public.categories(id uuid primary key default gen_random_uuid(),name_ar text not null,name_en text,slug text unique not null,created_at timestamptz default now());
insert into categories(name_ar,name_en,slug) values ('عام','General','general'),('تقنية','Technology','technology'),('اقتصاد','Business','business'),('رياضة','Sports','sports') on conflict do nothing;
create table public.news(id uuid primary key default gen_random_uuid(),category_id uuid references categories(id) on delete set null,author_id uuid references auth.users(id) on delete set null,title text not null check(char_length(title) between 3 and 180),excerpt text check(char_length(excerpt)<=300),body text not null,cover_image_url text,status news_status not null default 'draft',is_breaking boolean not null default false,is_pinned boolean not null default false,views bigint not null default 0,published_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());
create index news_feed_idx on news(status,is_pinned desc,published_at desc);
create table public.comments(id uuid primary key default gen_random_uuid(),news_id uuid not null references news(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,parent_id uuid references comments(id) on delete cascade,body text not null check(char_length(body) between 1 and 2000),status content_status not null default 'visible',created_at timestamptz default now());
create index comments_news_idx on comments(news_id,created_at desc);
create table public.comment_likes(comment_id uuid references comments(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,created_at timestamptz default now(),primary key(comment_id,user_id));
create table public.chat_rooms(id uuid primary key default gen_random_uuid(),name text not null,slug text unique not null,created_at timestamptz default now());
insert into chat_rooms(name,slug) values('غرفة المجتمع العامة','general') on conflict(slug) do nothing;
create table public.chat_messages(id uuid primary key default gen_random_uuid(),room_id uuid not null references chat_rooms(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,body text not null check(char_length(body) between 1 and 1500),reply_to uuid references chat_messages(id) on delete set null,is_hidden boolean not null default false,created_at timestamptz default now());
create index chat_messages_room_idx on chat_messages(room_id,created_at);
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,title text not null,body text,link text,is_read boolean not null default false,created_at timestamptz default now());
create table public.reports(id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id) on delete cascade,target_type report_target not null,target_id uuid not null,reason text not null check(char_length(reason) between 5 and 1000),status report_status not null default 'open',reviewed_by uuid references auth.users(id),created_at timestamptz default now(),reviewed_at timestamptz);
create table public.moderation_actions(id uuid primary key default gen_random_uuid(),moderator_id uuid not null references auth.users(id),target_type report_target not null,target_id uuid not null,action text not null,reason text,created_at timestamptz default now());
create table public.admin_audit_logs(id bigint generated always as identity primary key,actor_id uuid references auth.users(id),action text not null,target_type text,target_id text,details jsonb not null default '{}',created_at timestamptz default now());
create table public.platform_settings(key text primary key,value jsonb not null,updated_by uuid references auth.users(id),updated_at timestamptz default now());
insert into platform_settings(key,value) values('site_name','"Warm Media"'),('default_avatar_a','""'),('default_avatar_b','""') on conflict do nothing;

-- Role and permission helpers (SECURITY DEFINER functions have fixed search_path).
create or replace function public.get_my_role() returns text language sql stable security definer set search_path=public as $$
 select r.name from user_roles ur join roles r on r.id=ur.role_id where ur.user_id=auth.uid()
 order by case r.name when 'super_admin' then 1 when 'admin' then 2 when 'moderator' then 3 else 4 end limit 1
$$;
create or replace function public.has_permission(required_code text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from user_roles ur join role_permissions rp on rp.role_id=ur.role_id join permissions p on p.id=rp.permission_id where ur.user_id=auth.uid() and p.code=required_code)
$$;
create or replace function public.increment_news_view(target_news_id uuid) returns void language sql security definer set search_path=public as $$
 update news set views=views+1 where id=target_news_id and status='published'
$$;
-- New account profile is created from trusted auth metadata; no role is granted here.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,display_name,avatar_url,avatar_kind)
 values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)),new.raw_user_meta_data->>'avatar_url',
 case when new.raw_user_meta_data->>'avatar_url' is null then null else 'default_a' end);
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table profiles enable row level security; alter table roles enable row level security; alter table permissions enable row level security; alter table role_permissions enable row level security; alter table user_roles enable row level security; alter table categories enable row level security; alter table news enable row level security; alter table comments enable row level security; alter table comment_likes enable row level security; alter table chat_rooms enable row level security; alter table chat_messages enable row level security; alter table notifications enable row level security; alter table reports enable row level security; alter table moderation_actions enable row level security; alter table admin_audit_logs enable row level security; alter table platform_settings enable row level security;

create policy "profiles public read" on profiles for select using (is_disabled=false or id=auth.uid() or has_permission('users.manage'));
create policy "profile owner update" on profiles for update using (id=auth.uid() and is_disabled=false) with check (id=auth.uid());
create policy "staff manage profiles" on profiles for update using (has_permission('users.manage')) with check (has_permission('users.manage'));
create policy "roles visible to authenticated" on roles for select to authenticated using (true);
create policy "permissions visible to authenticated" on permissions for select to authenticated using (true);
create policy "role permissions visible" on role_permissions for select to authenticated using (true);
create policy "user sees own roles" on user_roles for select to authenticated using (user_id=auth.uid() or has_permission('admins.manage'));
create policy "super admin manages roles" on user_roles for all to authenticated using (has_permission('admins.manage')) with check (has_permission('admins.manage'));
create policy "categories public read" on categories for select using (true);
create policy "staff manage categories" on categories for all to authenticated using (has_permission('news.manage')) with check (has_permission('news.manage'));
create policy "published news public read" on news for select using (status='published' or has_permission('news.manage'));
create policy "staff manage news" on news for all to authenticated using (has_permission('news.manage')) with check (has_permission('news.manage'));
create policy "visible comments read" on comments for select using (status='visible' or user_id=auth.uid() or has_permission('chat.moderate'));
create policy "signed users comment" on comments for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from news n where n.id=news_id and n.status='published') and char_length(trim(body))>0);
create policy "owner delete own comment" on comments for delete to authenticated using (user_id=auth.uid());
create policy "moderators update comments" on comments for update to authenticated using (has_permission('chat.moderate')) with check (has_permission('chat.moderate'));
create policy "comment likes read" on comment_likes for select using (true);
create policy "like as self" on comment_likes for insert to authenticated with check(user_id=auth.uid());
create policy "unlike as self" on comment_likes for delete to authenticated using(user_id=auth.uid());
create policy "rooms public read" on chat_rooms for select using(true);
create policy "messages read" on chat_messages for select using(is_hidden=false or user_id=auth.uid() or has_permission('chat.moderate'));
create policy "members send messages" on chat_messages for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from profiles p where p.id=auth.uid() and p.is_disabled=false) and char_length(trim(body))>0);
create policy "own messages delete" on chat_messages for delete to authenticated using(user_id=auth.uid());
create policy "moderate messages" on chat_messages for update to authenticated using(has_permission('chat.moderate')) with check(has_permission('chat.moderate'));
create policy "notifications own read" on notifications for select to authenticated using(user_id=auth.uid());
create policy "notifications own update" on notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "reports submit" on reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "staff review reports" on reports for select to authenticated using(has_permission('reports.review'));
create policy "staff update reports" on reports for update to authenticated using(has_permission('reports.review')) with check(has_permission('reports.review'));
create policy "staff moderation log" on moderation_actions for select to authenticated using(has_permission('reports.review'));
create policy "staff write moderation log" on moderation_actions for insert to authenticated with check(has_permission('reports.review') and moderator_id=auth.uid());
create policy "audit staff read" on admin_audit_logs for select to authenticated using(has_permission('admins.manage'));
create policy "audit staff insert" on admin_audit_logs for insert to authenticated with check(actor_id=auth.uid() and has_permission('admins.manage'));
create policy "settings public read" on platform_settings for select using(true);
create policy "super admin settings" on platform_settings for all to authenticated using(has_permission('settings.manage')) with check(has_permission('settings.manage'));

-- Enable realtime publication for chat messages (if not already included).
do $$ begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; end $$;
-- Storage: create a public bucket for editorial images in Supabase Storage dashboard, then add policies:
-- bucket id: warm-media-public; public read. Authenticated staff upload/update/delete only.
