# 15-tasks-user-profile-pictures.md

> Implementation tasks for the user profile pictures feature.
> Source spec: `15-spec-user-profile-pictures.md`.

## Relevant Files

| File                                                                                                                                | Why It Is Relevant                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/<timestamp>_avatars_bucket.sql`                                                                                | New migration: creates public `avatars` bucket (5MB), RLS policies, and adds `profile_photo_path` + `profile_photo_updated_at` to `public.users`. |
| `database.types.ts`                                                                                                                 | Regenerated (`yarn db:generate`) to include the two new `users` columns.                                                                          |
| `services/identity/user/types.ts`                                                                                                   | User domain type — add `profile_photo_path` + `profile_photo_updated_at`.                                                                         |
| `lib/users/types.ts`                                                                                                                | Secondary User type — add the same fields for consumers using this type.                                                                          |
| `services/identity/user/repository.ts`                                                                                              | `GetUserInfoQuery` (add columns) + new update/clear methods for the photo fields.                                                                 |
| `services/identity/user/user-service.ts`                                                                                            | Business logic for setting/clearing the avatar fields.                                                                                            |
| `services/identity/user/actions.ts`                                                                                                 | New Result-based server action(s): `updateUserProfilePhoto`, `removeUserProfilePhoto`.                                                            |
| `services/identity/user/actions.test.ts`                                                                                            | Tests for the new server action(s) (set + clear behavior).                                                                                        |
| `lib/avatar/avatar-url.ts`                                                                                                          | Pure helper: build public CDN URL from path + `?v={updated_at}` cache-buster.                                                                     |
| `lib/avatar/avatar-url.test.ts`                                                                                                     | Unit tests for URL + cache-buster construction.                                                                                                   |
| `lib/avatar/initials.ts`                                                                                                            | Pure helper: derive initials (first+last, email fallback) + deterministic color from id.                                                          |
| `lib/avatar/initials.test.ts`                                                                                                       | Unit tests for initials + color determinism.                                                                                                      |
| `lib/avatar/crop-image.ts`                                                                                                          | Canvas helper: take source image + crop area → 256×256 WebP `Blob`.                                                                               |
| `lib/avatar/crop-image.test.ts`                                                                                                     | Unit tests for output dimensions/type (jsdom canvas-mocked).                                                                                      |
| `lib/avatar/upload-client.ts`                                                                                                       | Client helper: upload the WebP blob to `avatars/{userId}.webp` (upsert) via the authed Supabase client; friendly error mapping.                   |
| `lib/avatar/validate-file.ts`                                                                                                       | Pure helper: `validateAvatarFile(file)` enforces accepted types (jpeg/png/webp) + ≤5MB; returns a friendly error string or ok.                    |
| `lib/avatar/validate-file.test.ts`                                                                                                  | Unit tests: accepted types pass, wrong type rejected, oversize rejected.                                                                          |
| `components/user-avatar.tsx`                                                                                                        | New reusable `UserAvatar` (shadcn `Avatar` + `AvatarImage` + initials fallback).                                                                  |
| `components/avatar/avatar-cropper-dialog.tsx`                                                                                       | New crop modal using `react-easy-crop` (circular overlay + zoom); reused by profile + signup.                                                     |
| `components/ui/avatar.tsx`                                                                                                          | Existing shadcn Avatar primitives (composed by `UserAvatar`).                                                                                     |
| `components/navbar/user-menu.tsx`                                                                                                   | Replace email-initial Avatar with `UserAvatar`.                                                                                                   |
| `components/admin/sidebar/nav-user.tsx`                                                                                             | Replace initials Avatar with `UserAvatar`.                                                                                                        |
| `app/(public)/profile/page.tsx`                                                                                                     | Add avatar display + cropper + upload/remove controls.                                                                                            |
| `components/auth/AuthForm.tsx`                                                                                                      | Add optional, skippable avatar picker; upload after successful `signUp`.                                                                          |
| `app/(public)/home/dashboard.tsx`                                                                                                   | Add `UserAvatar` to greeting / rector banner.                                                                                                     |
| `components/weekend/roster-view/config/columns.tsx` + roster query                                                                  | Add `UserAvatar` to the name column; ensure roster query selects the photo fields.                                                                |
| `components/weekend/roster-view/add-team-member-modal.tsx` + its user-list query                                                    | Avatars in the member combobox/list.                                                                                                              |
| `app/admin/users/config/columns.tsx` + master-roster query                                                                          | Replace `UserIcon` with `UserAvatar`; ensure query selects photo fields.                                                                          |
| `app/(public)/roster-builder/components/slot-cards.tsx`, `community-sheet.tsx` + roster-builder member query                        | Avatars on slot cards + community member list.                                                                                                    |
| `app/admin/community-board/components/role-card.tsx`, `pre-weekend-role-card.tsx`, `role-assignment-dialog.tsx` + role member query | Avatars on role cards + assignment search.                                                                                                        |
| `components/admin/sidebar/impersonation-dialog.tsx` + impersonation user-list query                                                 | Avatars in the impersonation selector.                                                                                                            |
| `package.json`                                                                                                                      | Add `react-easy-crop` dependency.                                                                                                                 |

### Notes

- Co-locate tests beside source as `.test.ts` (no `__tests__` dirs); run with `yarn test` (Jest).
- Keep all avatar logic that needs testing in pure helpers (`lib/avatar/*`) so tests follow
  the repo's existing pure-TS/jest pattern (no React Testing Library is installed).
- Server actions return `Result<Error, T>`; use `Results.*` and `isNil()`; never surface raw
  errors — use `toastError()`.
- UI uses shadcn only. Preserve desktop table layouts; add avatars to mobile cards per the
  responsive admin guidelines.
- DB workflow: `yarn db:migrate <desc>` → edit SQL → `yarn db:reset` → `yarn db:generate`.
- Quick validation: `npx tsc --noEmit` and `yarn lint`. Commits: Conventional Commits, ≤100-char header.

## Tasks

### [x] 1.0 Storage & data-model foundation (bucket, RLS, `users` columns, types)

Create the `avatars` public bucket with RLS, add the two new columns to `public.users`,
and regenerate types. Backend foundation everything else depends on.

#### 1.0 Proof Artifact(s)

- Migration file: `supabase/migrations/<timestamp>_avatars_bucket.sql` creating a public
  `avatars` bucket (5MB), RLS (public read; owner may write/delete only `{auth.uid()}.webp`),
  and the two `users` columns demonstrates storage + data model exist.
- CLI: `yarn db:reset` completes without error demonstrates the migration applies cleanly.
- Diff: `database.types.ts` shows `profile_photo_path` + `profile_photo_updated_at` on `users`
  demonstrates type-safe access.
- CLI/SQL: a write-isolation check (e.g. `psql` as user A attempting to write
  `<userB>.webp`) is denied by RLS demonstrates owner-only write enforcement.

#### 1.0 Tasks

- [x] 1.1 Run `yarn db:migrate avatars_bucket` to scaffold a migration file.
- [x] 1.2 In the migration, create a public `avatars` bucket via `storage.buckets`
      (`public = true`, `file_size_limit = 5242880`, allowed mime types
      `image/webp,image/jpeg,image/png`).
- [x] 1.3 Add RLS policies on `storage.objects` for `bucket_id = 'avatars'`: public `SELECT`;
      `INSERT`/`UPDATE`/`DELETE` allowed only when `name = auth.uid()::text || '.webp'`.
- [x] 1.4 In the same migration, `ALTER TABLE public.users ADD COLUMN profile_photo_path text`
      and `ADD COLUMN profile_photo_updated_at timestamptz`.
- [x] 1.5 Run `yarn db:reset` to apply; confirm no errors.
- [x] 1.6 Run `yarn db:generate`; confirm the new columns appear in `database.types.ts`.
- [x] 1.7 Add `profile_photo_path` + `profile_photo_updated_at` to `services/identity/user/types.ts`
      and `lib/users/types.ts`.
- [x] 1.8 Verify RLS write-isolation: confirm an authenticated user can write only their own
      `{uid}.webp` and is denied writing another user's path; capture the denial as the 1.0
      write-isolation proof artifact.

### [x] 2.0 Reusable `UserAvatar` component + client image utilities

Build the shared `UserAvatar` (CDN image with cache-buster + deterministic initials
fallback) and the pure helpers it relies on, with unit tests. Wire it into the two existing
Avatar surfaces (navbar, admin sidebar).

#### 2.0 Proof Artifact(s)

- Test: `lib/avatar/avatar-url.test.ts` passes demonstrates the public URL includes the
  `?v={updated_at}` cache-buster and returns null when no path exists (FR: cache-bust URL).
- Test: `lib/avatar/initials.test.ts` passes demonstrates first+last initials with email
  fallback and a deterministic color per id (FR: initials fallback).
- Screenshot: navbar + admin sidebar rendering `UserAvatar` initials fallback demonstrates
  the shared component is integrated.

#### 2.0 Tasks

- [x] 2.1 Create `lib/avatar/avatar-url.ts` building the `avatars` public URL for a path and
      appending `?v=<epoch of profile_photo_updated_at>`; return `null` when path is nil.
- [x] 2.2 Add `lib/avatar/avatar-url.test.ts` covering: path present → URL with `?v=`,
      path nil → null, updated_at changes → different `?v=`.
- [x] 2.3 Create `lib/avatar/initials.ts`: `getInitials({first_name,last_name,email})` and
      `getAvatarColor(id)` (deterministic hash → palette).
- [x] 2.4 Add `lib/avatar/initials.test.ts` covering names present, names missing (email
      fallback), and same-id-same-color.
- [x] 2.5 Create `components/user-avatar.tsx` composing shadcn `Avatar`/`AvatarImage`/
      `AvatarFallback`, accepting `{ user, size }`; render image via `avatar-url` else initials
      with `getAvatarColor`.
- [x] 2.6 Replace the Avatar block in `components/navbar/user-menu.tsx` with `UserAvatar`.
- [x] 2.7 Replace the Avatar block in `components/admin/sidebar/nav-user.tsx` with `UserAvatar`.

### [ ] 3.0 Profile-page upload, crop, replace & remove

Add the avatar edit experience to the profile page: pick → crop → upload → persist, plus
remove. Build the reusable cropper dialog here.

#### 3.0 Proof Artifact(s)

- Screenshot: crop modal (circular overlay + zoom) on the profile page demonstrates the crop UX.
- Screenshot: profile page + navbar showing the newly uploaded photo (URL contains `?v=`)
  demonstrates end-to-end upload + cache-busted display.
- Screenshot: profile page after "Remove photo" reverting to initials demonstrates removal.
- Test: `services/identity/user/actions.test.ts` passes demonstrates the update action sets
  and the remove action clears `profile_photo_path` + `profile_photo_updated_at` and returns
  `Result` (FR: persist/clear photo).
- Test: `lib/avatar/crop-image.test.ts` passes demonstrates a cropped source yields a
  256×256 `image/webp` blob (FR: client resize to 256×256 WebP).
- Test: `lib/avatar/validate-file.test.ts` passes demonstrates accepted types pass and a
  wrong type / oversize file is rejected with a friendly message (FR: client-side validation).

#### 3.0 Tasks

- [ ] 3.1 `yarn add react-easy-crop`.
- [ ] 3.2 Create `lib/avatar/crop-image.ts`: given an image source + crop area, draw to a
      256×256 canvas and `toBlob('image/webp', ~0.85)`; add `lib/avatar/crop-image.test.ts`.
- [ ] 3.3 Create `lib/avatar/upload-client.ts`: upload a blob to `avatars/{userId}.webp` with
      `upsert: true` via the authed Supabase client; map errors to friendly messages.
- [ ] 3.4 Create `lib/avatar/validate-file.ts` (`validateAvatarFile`) + `validate-file.test.ts`,
      then create `components/avatar/avatar-cropper-dialog.tsx`: file input (calling
      `validateAvatarFile` for type/size with friendly errors) → `react-easy-crop` circular crop +
      zoom slider → on save, call `crop-image` and return the WebP blob.
- [ ] 3.5 Add update/clear methods to `services/identity/user/repository.ts` and
      `user-service.ts`; add `updateUserProfilePhoto` + `removeUserProfilePhoto` actions in
      `services/identity/user/actions.ts` (set/clear `profile_photo_path` + set
      `profile_photo_updated_at = now()`), returning `Result`.
- [ ] 3.6 Add `services/identity/user/actions.test.ts` for set + clear.
- [ ] 3.7 On `app/(public)/profile/page.tsx`: add a large `UserAvatar` with an "Edit photo"
      control opening the cropper; on confirm, upload via `upload-client`, call the action, refresh.
      Use `toastError` for failures.
- [ ] 3.8 Add a "Remove photo" control that deletes `avatars/{userId}.webp` and calls
      `removeUserProfilePhoto`, reverting to initials.

### [ ] 4.0 Optional avatar during account creation

Reuse the cropper in the signup form; upload after a successful `signUp`; never block signup.

#### 4.0 Proof Artifact(s)

- Screenshot: signup form showing the optional, skippable avatar picker demonstrates the entry point.
- Screenshot: post-signup navbar showing the chosen photo demonstrates the happy path.
- Screenshot: a new account created **without** a photo showing initials demonstrates the
  skip path does not block signup.

#### 4.0 Tasks

- [ ] 4.1 Add the `avatar-cropper-dialog` to `components/auth/AuthForm.tsx` register mode as
      an optional control; hold the resulting blob in local state (no upload yet).
- [ ] 4.2 After `supabase.auth.signUp` succeeds and a session exists, if a blob is present,
      upload to `avatars/{userId}.webp` and call `updateUserProfilePhoto`.
- [ ] 4.3 Ensure a skipped photo or a failed upload does not block account creation; surface
      any upload failure as a non-blocking `toastError` and continue the redirect.

### [ ] 5.0 Roll `UserAvatar` out across all in-scope user surfaces

Wire the photo fields into each surface's query and render `UserAvatar`, preserving desktop
layouts and adding avatars to mobile cards.

#### 5.0 Proof Artifact(s)

- Screenshots: master roster, weekend roster, a roster-builder slot card, and a role card
  each showing real user photos demonstrates broad rollout.
- Screenshot: a member-picker dropdown (add-team-member or role assignment dialog) showing
  avatars demonstrates pickers are covered.
- CLI: `npx tsc --noEmit` and `yarn lint` both pass demonstrates no type/lint regressions.
- Checklist/screenshots: a per-surface spot-check confirming each surface still lists the same
  people with correct names/data after the query edits demonstrates no data regression.

#### 5.0 Tasks

- [ ] 5.1 Audit each surface's data query and add `profile_photo_path` +
      `profile_photo_updated_at` to the selected user fields (start from `GetUserInfoQuery`;
      repeat for weekend roster, master roster, roster-builder community, role member, impersonation,
      and add-team-member queries).
- [ ] 5.2 Dashboard greeting / rector banner (`app/(public)/home/dashboard.tsx`): add `UserAvatar`.
- [ ] 5.3 Weekend roster name column (`components/weekend/roster-view/config/columns.tsx`):
      add `UserAvatar` (desktop) + mobile card.
- [ ] 5.4 Master roster (`app/admin/users/config/columns.tsx`): replace `UserIcon` with `UserAvatar`.
- [ ] 5.5 Roster builder (`slot-cards.tsx`, `community-sheet.tsx`): add `UserAvatar`.
- [ ] 5.6 Role cards (`role-card.tsx`, `pre-weekend-role-card.tsx`) + `role-assignment-dialog.tsx`:
      add `UserAvatar`.
- [ ] 5.7 Impersonation selector (`components/admin/sidebar/impersonation-dialog.tsx`): add `UserAvatar`.
- [ ] 5.8 Add-team-member modal (`components/weekend/roster-view/add-team-member-modal.tsx`):
      add `UserAvatar` to the combobox/list.
- [ ] 5.9 Run `npx tsc --noEmit` and `yarn lint`; fix any issues. Spot-check each modified
      surface still lists the same people with correct names/data (no regression from the query edits).
