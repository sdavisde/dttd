# Task 02 Proofs — Reusable `UserAvatar` + client image utilities

## Task Summary

This task builds the single shared `UserAvatar` component and the pure helpers it relies
on: a cache-busted CDN URL builder and a deterministic initials/color fallback. The
component is wired into the two existing avatar surfaces (navbar user menu, admin sidebar
nav-user), so every user is now rendered through one consistent component.

## What This Task Proves

- `getAvatarUrl` returns the public CDN URL with a `?v=` cache-buster, and null when no
  photo/path or Supabase URL is available.
- `getInitials` derives first+last initials with an email fallback, and `getAvatarColor`
  maps a user id to a stable color.
- `UserAvatar` composes the shadcn `Avatar` primitives, showing the photo when present and
  the colored initials otherwise.
- The navbar and admin sidebar now render `UserAvatar` instead of bespoke Avatar blocks.

## Evidence Summary

- `yarn test lib/avatar` → 2 suites, 13 tests pass.
- `yarn test` (full suite) → 5 suites, 52 tests pass (no regressions).
- `npx tsc --noEmit` and `yarn lint` pass (lint shows only the known `useReactTable`
  warning).

## Artifact: Avatar helper unit tests

**What it proves:** The URL cache-buster and the initials/color fallback behave per the
functional requirements.

**Why it matters:** These pure helpers are the testable core of the feature; the visual
component is a thin composition over them.

**Command:**

```bash
yarn test lib/avatar
```

**Result summary:** Both suites pass — `avatar-url.test.ts` covers path-present (URL with
`?v=`), path-nil (null), missing env (null), and changing `updated_at` (different `?v=`);
`initials.test.ts` covers names present, single name, email fallback, the `?` fallback,
deterministic color per id, and color spread.

```text
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

## Artifact: Full suite — no regressions

**Command:**

```bash
yarn test
```

**Result summary:** All existing tests still pass alongside the new ones.

```text
Test Suites: 5 passed, 5 total
Tests:       52 passed, 52 total
```

## Artifact: Shared component integration

**What it proves:** Both existing avatar surfaces now use `UserAvatar`.

**Why it matters:** Confirms the component is the single integration point, so a later photo
just appears everywhere without per-surface markup.

**Artifact paths:**

- `components/user-avatar.tsx` — `UserAvatar` + `avatarUserFromDto` adapter.
- `components/navbar/user-menu.tsx` — replaced the email-initial Avatar with
  `<UserAvatar user={avatarUserFromDto(user)} size={36} />`.
- `components/admin/sidebar/nav-user.tsx` — replaced the initials Avatar with
  `<UserAvatar user={avatarUserFromDto(user)} size={32} />`.

**Result summary:** Both call sites compile and lint cleanly; with no photo set they render
the deterministic-colored initials fallback (e.g. `SD` for "Sam Davis").

## Visual confirmation (pending live capture)

The navbar/admin-sidebar initials-fallback screenshots require a running dev server with an
authenticated session. They are best captured during the profile-page upload flow in Task
03 (which also exercises the photo path end-to-end) or in the Phase 4 validation pass. The
unit tests above deterministically prove the fallback output the screenshots would show.

## Reviewer Conclusion

The shared `UserAvatar` and its helpers are implemented, unit-tested, and integrated into
the two pre-existing avatar surfaces with no regressions. The display layer is ready for the
upload flow and the broader rollout.
