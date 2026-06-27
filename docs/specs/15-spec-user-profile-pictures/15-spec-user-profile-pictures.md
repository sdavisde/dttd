# 15-spec-user-profile-pictures.md

## Introduction/Overview

This feature lets community members with login accounts (DTTD **users**) upload a
personal profile picture and have it appear everywhere they are referenced in the
app — the navbar, rosters, role cards, member pickers, and their own profile page.
The primary goal is to make people recognizable across the platform while keeping
the implementation cheap to run: avatars are stored as small, pre-optimized images
in a public Supabase Storage bucket and served straight from Supabase's built-in
CDN, avoiding both Supabase Image Transformation charges and Vercel image-optimization
usage.

This spec covers users only (people in `public.users`). Candidates (guests with no
account) are explicitly out of scope.

## Goals

1. Allow a logged-in user to upload, crop, replace, and remove their own profile
   picture from their profile page, and optionally during account creation.
2. Display a user's avatar (with a graceful initials fallback) consistently
   everywhere a user is rendered, via a single reusable `UserAvatar` component.
3. Keep marginal cost per avatar near zero: one optimized WebP per user, served from
   the Supabase CDN with no per-read image transformation and no Vercel image
   optimization.
4. Reuse existing repository patterns (shadcn `Avatar`, the service → repository data
   layer, Result-based server actions) so the change is consistent and maintainable.

## User Stories

- **As a team member**, I want to upload a photo of myself so that other members can
  recognize me on rosters and in the navbar.
- **As a new user**, I want to add a photo while creating my account so that my
  profile feels complete from the start, but I want to be able to skip it and add one
  later.
- **As a Pre-Weekend Couple member building a roster**, I want to see members' faces
  in the roster builder and member pickers so that I can assign people more confidently.
- **As any user**, I want to change or remove my photo at any time so that I stay in
  control of how I'm represented.
- **As the platform owner**, I want avatars served cheaply from a CDN so that growing
  usage does not materially increase Supabase or Vercel costs.

## Demoable Units of Work

### Unit 1: Storage foundation + reusable `UserAvatar` (initials everywhere)

**Purpose:** Establish the data model, bucket, and shared display component. After this
unit, every user surface renders an initials-based avatar in a consistent style, even
though no one can upload yet.

**Functional Requirements:**

- The system shall add a public Supabase Storage bucket named `avatars` with a 5MB
  per-object size limit, created via a SQL migration.
- The system shall add Row Level Security policies so that any user may **read** objects
  in `avatars`, and an authenticated user may **insert/update/delete only their own**
  object at path `{auth.uid()}.webp`.
- The system shall add `profile_photo_path text null` and
  `profile_photo_updated_at timestamptz null` columns to `public.users`, and regenerate
  `database.types.ts`.
- The system shall provide a reusable `UserAvatar` component that accepts a user's
  name, id, and optional `profile_photo_path` + `profile_photo_updated_at`, renders the
  CDN image when a path exists, and otherwise renders an initials fallback built from
  `first_name`/`last_name` (falling back to the email initial) with a deterministic
  background color.
- The system shall construct the avatar URL as the bucket public URL for the stored path
  with a cache-busting `?v={profile_photo_updated_at}` query parameter.

**Proof Artifacts:**

- Migration file: `avatars` bucket + RLS policies + `users` columns demonstrates the
  data model exists.
- Screenshot: navbar and weekend roster rendering `UserAvatar` initials fallback
  demonstrates the shared component is wired in.
- `database.types.ts` diff: shows the new `users` columns demonstrates type safety.

### Unit 2: Upload, crop, replace, and remove on the profile page

**Purpose:** Give users full control of their own photo from the profile page — the
primary edit surface.

**Functional Requirements:**

- The user shall be able to select an image file on the profile page and crop it in a
  modal using `react-easy-crop` with a circular overlay and a zoom/pan control.
- The system shall, on confirm, render the crop to a square canvas, resize to
  256×256, and encode a WebP blob before upload.
- The system shall upload the blob to `avatars/{userId}.webp` (overwriting any existing
  file), then set `profile_photo_path` and `profile_photo_updated_at` on the user's
  record via a server action following the existing action → service → repository layers.
- The user shall be able to remove their photo, which deletes the storage object, clears
  `profile_photo_path` and `profile_photo_updated_at`, and reverts all surfaces to the
  initials fallback.
- The system shall validate input client-side: accept `image/jpeg`, `image/png`, and
  `image/webp`, reject files over 5MB, and show a friendly error (via `toastError`) on
  failure without exposing raw storage errors.

**Proof Artifacts:**

- Screenshot: crop modal (circular overlay + zoom) demonstrates the crop UX.
- Screenshot: profile page + navbar showing the uploaded photo demonstrates end-to-end
  upload and cache-busted display.
- Screenshot: profile page after "Remove photo" showing initials fallback demonstrates
  removal works.

### Unit 3: Optional avatar during account creation

**Purpose:** Let new users add a photo while signing up, without adding friction for
those who skip it.

**Functional Requirements:**

- The user shall see an optional, skippable avatar picker in the signup form
  (`AuthForm.tsx`) that reuses the same crop component from Unit 2.
- The system shall, after a successful `supabase.auth.signUp` that returns a session,
  upload the cropped blob to `avatars/{userId}.webp` and set the user's
  `profile_photo_path` / `profile_photo_updated_at`.
- The system shall complete account creation normally if the user skips the photo or if
  the post-signup upload fails (the failure shall not block account creation and shall
  surface a friendly, non-blocking message).

**Proof Artifacts:**

- Screenshot: signup form with optional avatar picker demonstrates the entry point.
- Screenshot: post-signup navbar showing the chosen photo demonstrates the flow.

### Unit 4: Roll `UserAvatar` out across all user surfaces

**Purpose:** Apply real photos everywhere a user is rendered by wiring
`profile_photo_path` / `profile_photo_updated_at` into the relevant queries and swapping
in `UserAvatar`.

**Functional Requirements:**

- The system shall include `profile_photo_path` and `profile_photo_updated_at` in the
  queries backing each user surface (e.g. `GetUserInfoQuery`, weekend roster, master
  roster, roster builder community/member queries, role assignment lists, impersonation
  list, add-team-member picker).
- The system shall render `UserAvatar` in all of the following surfaces, preserving
  existing desktop layouts and following the mobile-responsive card guidelines where
  applicable:
  1. Navbar user menu (`components/navbar/user-menu.tsx`)
  2. Admin sidebar nav-user (`components/admin/sidebar/nav-user.tsx`)
  3. Dashboard greeting / rector banner (`app/(public)/home/dashboard.tsx`)
  4. Weekend roster table (`components/weekend/roster-view/...`)
  5. Admin master roster table (`app/admin/users/...`)
  6. Roster builder slot cards + community sheet (`app/(public)/roster-builder/...`)
  7. Role assignment cards — board + pre-weekend couple
     (`app/admin/community-board/components/role-card.tsx`,
     `pre-weekend-role-card.tsx`)
  8. Role assignment dialog member search
     (`app/admin/community-board/components/role-assignment-dialog.tsx`)
  9. Impersonation user selector
     (`components/admin/sidebar/impersonation-dialog.tsx`)
  10. Add-team-member modal user combobox
      (`components/weekend/roster-view/add-team-member-modal.tsx`)

**Proof Artifacts:**

- Screenshots: master roster, weekend roster, roster builder, and a role card each
  showing real user photos demonstrates broad rollout.
- Screenshot: a member-picker dropdown (add-team-member or role assignment) showing
  avatars demonstrates pickers are covered.

## Non-Goals (Out of Scope)

1. **Candidate avatars**: Candidates (`candidate_info`) and candidate-provided sponsor
   names will not get profile pictures. The schema/bucket layout should not preclude
   adding them later, but no candidate work is included.
2. **Meeting-minutes "uploaded by" avatars**: Requires capturing/displaying an uploader,
   which is not shown today. Deferred.
3. **Payment owner avatars**: `payment_owner` is a mixed user/candidate string field and
   needs disambiguation. Deferred.
4. **Event organizer avatars**: Events have no organizer reference today. Deferred.
5. **Server-side / on-the-fly image transformations**: No use of Supabase Image
   Transformations or Vercel `<Image>` optimization for avatars (cost avoidance is a goal).
6. **Multiple stored sizes / responsive srcset per avatar**: A single 256×256 WebP is
   stored and used at all display sizes.
7. **Admin moderation of other users' photos**: No admin tooling to review, approve, or
   remove other users' avatars in v1.

## Design Considerations

- Avatars render circular at all sizes, consistent with the existing shadcn `Avatar`
  usage in the navbar and admin sidebar.
- The initials fallback uses the user's first + last initials (email initial only if
  names are missing) on a deterministic background color derived from the user id, so the
  same user always gets the same color.
- The crop experience follows the common avatar pattern: pick file → modal with a
  circular crop overlay and a zoom slider → save. Cancel discards with no upload.
- Display sizes: ~36px in navbar/table rows, larger (e.g. 96–128px) on the profile page.
- All table integrations must preserve existing desktop layouts and add avatars to the
  mobile card layouts per the repository's responsive admin guidelines.

## Repository Standards

- Use only shadcn/ui components (`components/ui/avatar.tsx` already exists). No other UI
  libraries.
- Server actions return `Result<Error, T>`; use `Results.*` helpers and `isNil()` for
  null checks.
- Never surface raw storage/database errors; use `toastError()` with a friendly message
  and let it log the raw error via pino.
- Follow the action → service → repository layering used in
  `services/identity/user/` for any new user/avatar mutations.
- Regenerate types with `yarn db:generate` after the migration; validate quickly with
  `npx tsc --noEmit` and `yarn lint` (auto-fix with `yarn lint --fix`).
- Co-locate any tests as `.test.ts` next to the code (no `__tests__` dirs); run `yarn test`.
- Commit messages: Conventional Commits, body lines ≤100 chars.

## Technical Considerations

- **Serving model**: Supabase Storage serves every object through a CDN by default;
  public-bucket objects are edge-cached with high hit rates. Avatars are tiny (~20–40KB),
  public, and rarely change — ideal for caching. URLs are the bucket public URL plus a
  `?v={profile_photo_updated_at}` cache-buster so replacements appear immediately.
- **No transformations**: All resizing/cropping happens client-side (canvas →
  `toBlob('image/webp')`) before upload, producing a single 256×256 file. This avoids the
  Supabase Image Transformation charge (~$5/1,000 origin images, Pro+) and avoids Vercel
  image optimization. Render avatars with a plain `<img>` / `AvatarImage` (not Next.js
  optimized `<Image>`) so they never hit the Vercel optimizer.
- **Upload mechanism**: Because avatars are small, upload directly from the client with
  the authenticated Supabase client to the `avatars` bucket; RLS enforces that a user can
  only write `{auth.uid()}.webp`. This is intentionally simpler than the signed-URL
  pattern in `lib/files/upload-client.ts`, which exists to bypass Next.js body-size
  limits for large admin documents — not a concern for ~30KB avatars. The user-record
  update (`profile_photo_path`, `profile_photo_updated_at`) goes through a Result-based
  server action in the existing user service layer.
- **Path & overwrite**: One file per user at `avatars/{userId}.webp`, overwritten on
  replace (`upsert`), so there are never orphaned files and no cleanup job is needed.
- **New dependency**: `react-easy-crop` (small, touch-friendly) for the crop modal. No
  server-side image library (e.g. sharp) is added.
- **Data plumbing**: Several queries must add the two new columns; the `UserAvatar`
  component degrades gracefully (initials) when they are absent, so surfaces can be
  migrated incrementally.

## Security Considerations

- The `avatars` bucket is public, so any avatar URL is world-readable. This is acceptable
  for low-sensitivity face photos and is required for cheap CDN caching. Filenames are the
  user's id (a UUID), which is not easily enumerable for guessing other users' photos.
- RLS must restrict writes/deletes to the owner's own object (`name = auth.uid()::text ||
'.webp'`); public read is allowed. Verify policies prevent a user from overwriting
  another user's avatar.
- Do not commit real uploaded photos as proof artifacts containing identifiable community
  members without consent; use test images or the developer's own photo.
- Client-side validation (type + size) is a UX guard, not a security boundary; the bucket
  size limit and RLS are the real enforcement.

## Success Metrics

1. **Cost neutrality**: No new Supabase Image Transformation usage and no increase in
   Vercel image-optimization usage attributable to avatars (verified in dashboards after
   rollout).
2. **Coverage**: All 11 in-scope user surfaces render `UserAvatar` (photo when present,
   initials otherwise).
3. **Round-trip works**: A user can upload, replace, and remove a photo, and the change is
   reflected across surfaces within one page load (cache-buster effective).
4. **No regressions**: Existing desktop table layouts unchanged; `npx tsc --noEmit` and
   `yarn lint` pass.

## Open Questions

1. **HEIC inputs**: iPhone photos are often HEIC, which Chrome cannot decode in-canvas
   (Safari can). v1 accepts JPEG/PNG/WebP and shows a friendly error on undecodable files;
   adding `heic2any` conversion can be a later enhancement. Non-blocking.
2. **Production email confirmation**: Local config has `enable_confirmations = false`, so
   signup returns a session and Unit 3's upload works immediately. If production ever
   enables confirmations, the signup-time upload should defer to first login; this should
   be confirmed against the production auth settings but does not change the spec's core
   design. Non-blocking.
3. **Very large member lists**: If any surface renders hundreds of avatars at once,
   consider lazy-loading images; current lists are small enough that this is not required
   for v1. Non-blocking.
