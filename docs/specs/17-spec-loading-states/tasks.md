# Loading States & Streaming — Task List

Goal: every navigation shows immediate feedback (skeleton/spinner inside the persistent layout), and pages
stream their static shell (breadcrumbs, titles, chrome) while data-dependent sections load behind Suspense
boundaries. End state unlocks flipping `cacheComponents: true` (Next 16 PPR) in `next.config.ts`.

Background/context: research findings from 2026-08-31 session. Key facts:

- Root `app/loading.tsx` is a full-screen spinner that replaces the entire page (navbar/footer included) on
  public navigations. `app/admin/loading.tsx` keeps the sidebar.
- `components/navbar/navbar-server.tsx` is async (storage `listBuckets()` liveness check whose data is
  discarded, then `getActiveWeekends()`), unwrapped in Suspense — blocks every public hard load.
- Auth (`getLoggedInUser` → `supabase.auth.getUser()`) is fetched 2–3× per request (proxy middleware, admin
  layout, then again per page) with no `React.cache()` dedup anywhere.
- Reference Suspense pattern already exists in `app/(public)/home/dashboard.tsx` (CurrentWeekendHero +
  skeleton, TeamMemberTodo + loading component). Skeleton primitive: `components/ui/skeleton.tsx`.

---

## Tier 1 — Immediate feedback + auth dedup (~1 hour)

- [x] 1.1 Add `app/(public)/loading.tsx` that renders a lightweight page-body skeleton _inside_ the public
      layout, so the navbar/footer persist during navigation (root `app/loading.tsx` currently nukes them).
- [x] 1.2 Wrap `getLoggedInUser` in `React.cache()` so middleware/layout/page calls within one request dedupe
      to a single Supabase round-trip.
- [x] 1.3 Wrap `getActiveWeekends` in `React.cache()` (called by navbar + multiple pages).
- [x] 1.4 Wrap the async `NavbarServer` in `<Suspense>` (inside `components/public-navbar.tsx` or the public
      layout) with a static navbar skeleton fallback, so the page shell flushes without waiting on storage +
      weekends queries.
- [x] 1.5 Verify: `npx tsc --noEmit` and `yarn lint` pass.

## Tier 2 — Free wins: waterfalls, dead fetches, one-line Suspense wraps (~2–4 hours)

- [ ] 2.1 Remove dead awaits:
  - `app/(public)/current-weekend/page.tsx` — `getLoggedInUser()` awaited, data never used.
  - `app/admin/settings/page.tsx` — `contactInformation` fetched, never rendered.
- [ ] 2.2 Parallelize pure waterfalls with `Promise.all`:
  - `app/admin/weekends/page.tsx` (`getWeekendGroupsByStatus` then `getLoggedInUser`)
  - `app/admin/users/page.tsx` (auth serial before the existing `Promise.all`)
  - `app/admin/roles/page.tsx` (auth → `getRoles`)
  - `app/admin/files/page.tsx` (auth → `getBuckets` → `getStorageUsage`, 3 serial)
  - `app/admin/payments/page.tsx` (auth → `getAllPaymentsIncludingVoided`)
  - `app/admin/meetings/page.tsx` (auth → `Promise.all(3)` → nested `getEventsForWeekendGroup`)
  - `app/(public)/roster/page.tsx` (auth → `getActiveWeekends`)
- [ ] 2.3 One-line Suspense wraps around already-async self-contained components:
  - `components/current-weekend/CurrentWeekendView.tsx` usage in `app/(public)/current-weekend/page.tsx`
  - `components/weekend/weekend-roster-view.tsx` usage in `app/(public)/roster/page.tsx` and
    `app/admin/weekends/[weekend_id]/page.tsx`
- [ ] 2.4 Also parallelize the admin layout's serial `getLoggedInUser()` → `getSidebarData()` awaits.
- [ ] 2.5 Verify: `npx tsc --noEmit` and `yarn lint` pass.

## Tier 3 — Push data fetching down per page (~30–60 min/page, ~13 pages)

Mechanical pattern per page (template: `app/(public)/home/dashboard.tsx`): keep breadcrumbs/title/static
chrome in the page, extract awaits into an async child component, wrap in `<Suspense>` with a skeleton, add
a segment `error.tsx` so failures don't bubble to root and blow away the shell.

- [ ] 3.1 `app/admin/page.tsx` (dashboard grid)
- [ ] 3.2 `app/admin/weekends/page.tsx`
- [ ] 3.3 `app/admin/users/page.tsx`
- [ ] 3.4 `app/admin/roles/page.tsx`
- [ ] 3.5 `app/admin/files/page.tsx`
- [ ] 3.6 `app/admin/payments/page.tsx`
- [ ] 3.7 `app/admin/meetings/page.tsx`
- [ ] 3.8 `app/admin/community-board/page.tsx`
- [ ] 3.9 `app/admin/settings/page.tsx` (largest static-shell ratio — easy)
- [ ] 3.10 `app/(public)/files/page.tsx`
- [ ] 3.11 `app/(public)/home/page.tsx` (push `getPrayerWheelUrlForGender` into a Suspense child feeding
      `QuickActions`)
- [ ] 3.12 `app/(public)/candidate-list/page.tsx` (awaits are inside `actions/candidate-list.ts` — extract)
- [ ] 3.13 `app/(public)/review-candidates/page.tsx`
- [ ] 3.14 Add segment-level `error.tsx` files alongside each converted page.
- [ ] 3.15 Redirect hygiene (CRITICAL — post-flush `redirect()`/`notFound()` becomes a client-side router
      dispatch, which crashes Next's Router via unfixed facebook/react#33580 when it lands in a deferred
      commit; already caused prod-reproducible crashes after Tier 1):
  - [x] Remove URL-decoration redirects that fire on every bare-URL visit: `actions/candidate-list.ts`
        and `actions/review-candidates.ts` now return computed defaults instead of redirecting.
  - [x] Add `_N: true` to raw `history.pushState/replaceState` calls (`hooks/useHashState.ts`,
        `app/(public)/profile/page.tsx`, `hooks/url-state/url-batcher.ts`) so Next's patched History API
        skips its internal router dispatch.
  - [ ] Hoist auth-gate redirects into `proxy.ts` (HTTP 307 before any render) so they never replay
        client-side: `team-forms/*` (layout + 6 pages), `roster`, `roster-builder`,
        `payment/candidate-fee` (+success), `payment/team-fee/success`.
  - [ ] Audit `notFound()` under `(public)` for the same mechanism (vercel/next.js#63388):
        `candidate/[candidateId]/forms`, `review-candidates/[candidate_id]`, `files/[...path]`,
        `payment/team-fee`.
  - [ ] Add `unstable_rethrow(error)` at the top of the catch in `lib/actions/authorized-action.ts:35` —
        it currently swallows Next control-flow throws (`redirect()`, `notFound()`, dynamic-usage).
  - [ ] Consider removing the `_N: true` flags once the upgrade (Next 16.3.4, commit 8f94685) is
        empirically confirmed to fix the deferred-dispatch crash — the vendored React now contains the
        upstream fix (facebook/react PR 36911), making the flags optional.
  - [ ] Rule for all remaining tiers: never dispatch a router action (router.push/replace/refresh, or
        unflagged History API) from a mount effect, and never leave an always-firing `redirect()` in a
        page/action that renders behind a Suspense or loading.tsx boundary.

## Tier 4 — Hard case + follow-on

- [ ] 4.1 `app/(public)/roster-builder/page.tsx` — restructure weekend-selection logic (permission branches,
      serial per-weekend roster loop). Page shape is data-determined; needs redesign, not await-moving.
      (~half day)
- [ ] 4.2 Flip `cacheComponents: true` in `next.config.ts` (Next 16 PPR). Requires Tiers 1–3 complete; will
      surface build errors anywhere an uncached dynamic read isn't inside a Suspense boundary.
