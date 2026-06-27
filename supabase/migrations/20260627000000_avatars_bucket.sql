-- User profile pictures (avatars).
-- See docs/specs/15-spec-user-profile-pictures.
--
-- Creates a public `avatars` storage bucket served straight from the Supabase CDN
-- (no image transformations), enforces owner-only writes to `{auth.uid()}.webp`,
-- and adds the two photo columns the app reads on `public.users`.

-- 1. Public avatars bucket: 5MB limit, web-friendly image types only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- 2. RLS for the avatars bucket.
--
-- NOTE: the baseline schema (20260118030550_remote_schema.sql) already defines broad
-- PERMISSIVE storage.objects policies: public SELECT, and authenticated INSERT/DELETE
-- with `true` checks (no UPDATE policy exists). Because RLS ORs permissive policies
-- together, permissive avatar policies alone could NOT prevent one user from writing
-- another user's object. We therefore:
--   * add a RESTRICTIVE insert/delete guard that ANDs with the broad policies and
--     limits the avatars bucket to the owner's own `{uid}.webp` (other buckets pass
--     through unchanged via the `bucket_id <> 'avatars'` escape hatch), and
--   * add a PERMISSIVE owner-only UPDATE policy (none exists today) so `upsert`
--     overwrites of an existing avatar succeed for the owner only.

-- Explicit public read for avatars (defensive: keeps CDN reads working even if the
-- broad baseline read policy is ever tightened).
create policy "Public read access to avatars"
on storage.objects
as permissive
for select
to public
using (bucket_id = 'avatars');

-- Owner-only insert within the avatars bucket.
create policy "Avatar owner insert only"
on storage.objects
as restrictive
for insert
to authenticated
with check (bucket_id <> 'avatars' or name = auth.uid()::text || '.webp');

-- Owner-only delete within the avatars bucket.
create policy "Avatar owner delete only"
on storage.objects
as restrictive
for delete
to authenticated
using (bucket_id <> 'avatars' or name = auth.uid()::text || '.webp');

-- Owner-only update (enables upsert overwrite of an existing avatar).
create policy "Avatar owner update only"
on storage.objects
as permissive
for update
to authenticated
using (bucket_id = 'avatars' and name = auth.uid()::text || '.webp')
with check (bucket_id = 'avatars' and name = auth.uid()::text || '.webp');

-- 3. Photo columns on public.users. NULL means "no photo" (initials fallback).
alter table "public"."users"
  add column "profile_photo_path" text,
  add column "profile_photo_updated_at" timestamptz;
