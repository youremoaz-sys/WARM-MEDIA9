-- Run after creating bucket "warm-media-public" in Supabase Storage.
create policy "Public can view Warm Media assets" on storage.objects for select using (bucket_id='warm-media-public');
create policy "News staff upload assets" on storage.objects for insert to authenticated with check (bucket_id='warm-media-public' and public.has_permission('news.manage'));
create policy "News staff update assets" on storage.objects for update to authenticated using (bucket_id='warm-media-public' and public.has_permission('news.manage')) with check (bucket_id='warm-media-public' and public.has_permission('news.manage'));
create policy "News staff delete assets" on storage.objects for delete to authenticated using (bucket_id='warm-media-public' and public.has_permission('news.manage'));

-- Profile and chat assets must not be publicly writable outside a validated server flow.
create policy "Users upload own profile avatar" on storage.objects for insert to authenticated
with check (
  bucket_id='warm-media-public'
  and (storage.foldername(name))[1]='profiles'
  and (storage.filename(name)) like (auth.uid()::text || '-%')
);
