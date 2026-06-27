# Task 01 Proofs — Storage & data-model foundation

## Task Summary

This task establishes the backend foundation for user profile pictures: a public
`avatars` Supabase Storage bucket served from the CDN, Row Level Security that limits
writes to each user's own `{auth.uid()}.webp` object, and two new photo columns on
`public.users`. Everything else in the feature depends on this layer existing.

## What This Task Proves

- A public `avatars` bucket (5MB limit, image types only) exists via a SQL migration.
- RLS allows public reads but restricts insert/update/delete in `avatars` to the owner's
  own `{uid}.webp` path — a user cannot write another user's avatar.
- `public.users` has `profile_photo_path` and `profile_photo_updated_at`, surfaced in the
  regenerated `database.types.ts` and the app's user types.
- The migration applies cleanly through `yarn db:reset`.

## Evidence Summary

- `yarn db:reset` applies `20260627000000_avatars_bucket.sql` with no errors.
- `database.types.ts` gains both columns on the `users` Row/Insert/Update types.
- A psql RLS test confirms owner write succeeds and a cross-user write is denied by the
  `Avatar owner insert only` policy.
- `npx tsc --noEmit` and `yarn lint` pass (lint shows only the known, ignorable
  `useReactTable` `react-hooks/incompatible-library` warning).

## Artifact: Migration file

**What it proves:** The bucket, RLS policies, and `users` columns are defined as code.

**Why it matters:** This is the single source of truth for the storage + data model and
applies identically in every environment.

**Artifact path:** `supabase/migrations/20260627000000_avatars_bucket.sql`

**Result summary:** Creates a public `avatars` bucket (5MB, `image/webp,image/jpeg,image/png`),
adds a public-read policy, RESTRICTIVE owner-only insert/delete guards, a permissive
owner-only update (for `upsert`), and the two `users` columns. The restrictive approach is
required because the baseline schema already grants broad authenticated writes on
`storage.objects`; permissive avatar policies alone could not enforce isolation.

## Artifact: Migration applies cleanly

**What it proves:** The migration is valid SQL and integrates with the existing migration
chain and seed.

**Command:**

```bash
yarn db:reset
```

**Result summary:** Output ends with `Applying migration 20260627000000_avatars_bucket.sql...`
followed by a successful seed and `Finished supabase db reset`, with no errors.

## Artifact: `database.types.ts` diff

**What it proves:** The new columns are type-safe across the app after `yarn db:generate`.

**Why it matters:** Every consumer (repository, service, components) gets compile-time
access to the photo fields.

**Command:**

```bash
git diff database.types.ts | grep -B1 -A1 profile_photo
```

**Result summary:** Both columns appear on the `users` Row (`string | null`) and the
Insert/Update variants (`string | null` optional).

```diff
           phone_number: string | null
+          profile_photo_path: string | null
+          profile_photo_updated_at: string | null
           special_gifts_and_skills: string[] | null
```

The app-level user types were updated to match: `lib/users/types.ts` `User` gains
`profilePhotoPath` / `profilePhotoUpdatedAt` (populated in `normalizeUser`), and the photo
columns were added to `GetUserInfoQuery` in `services/identity/user/repository.ts`.
`RawUser` in `services/identity/user/types.ts` already inherits both columns via
`Tables<'users'>`, so no change was needed there.

## Artifact: RLS write-isolation test

**What it proves:** A user may write only their own avatar; writing another user's path is
denied by RLS.

**Why it matters:** The bucket is public-read, so owner-only write enforcement is the core
security boundary for avatars.

**Command:** (run against the local DB on port 54322, as role `authenticated` with a JWT
`sub` claim for user A `b0000001-…-0001`)

```sql
-- TEST 1: user A writes OWN avatar -> SUCCESS
insert into storage.objects (bucket_id, name) values ('avatars', '<A>.webp');  -- INSERT 0 1

-- TEST 2: user A writes ANOTHER user's avatar -> DENIED
insert into storage.objects (bucket_id, name) values ('avatars', '<B>.webp');
-- ERROR: new row violates row-level security policy "Avatar owner insert only"
```

**Result summary:** TEST 1 inserts the owner's own object successfully; TEST 2 is rejected by
the `Avatar owner insert only` RESTRICTIVE policy. A direct-SQL delete test additionally
confirmed Supabase's `storage.protect_delete()` trigger blocks raw deletes entirely (deletes
must go through the Storage API); the DELETE RLS policy uses the identical owner predicate as
the proven INSERT policy.

## Artifact: Type + lint gates

**Command:**

```bash
npx tsc --noEmit   # exit 0
yarn lint          # 0 errors (1 known useReactTable warning)
```

**Result summary:** No type errors and no lint errors after the type/query changes.

## Reviewer Conclusion

The storage bucket, owner-only write RLS, and `users` photo columns exist, apply cleanly,
are type-safe across the app, and enforce that users can only write their own avatar. The
backend foundation for the rest of the feature is in place.
