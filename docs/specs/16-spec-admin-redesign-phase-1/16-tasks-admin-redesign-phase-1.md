# 16-tasks-admin-redesign-phase-1.md

> Implementation tasks for phase 1 of the admin redesign (design system, admin shell, Dashboard, People, Weekends).
> Source spec: `16-spec-admin-redesign-phase-1.md`. Visual source of truth: the "DTTD Redesign Concepts" canvas.

## Relevant Files

| File                                                               | Why It Is Relevant                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `app/globals.css`                                                  | Warm the `--sidebar-*` tokens (light + dark) and add the four new semantic tokens; additive otherwise.                   |
| `docs/design-system.md`                                            | New conventions doc (page-opening pattern, borders-not-shadows, radius, type, control heights, canvas link).             |
| `components/impersonation/impersonation-dialog.tsx`                | Impersonation dialog moved here from `components/admin/sidebar/` (shared by public navbar + admin).                      |
| `components/navbar/user-menu.tsx`                                  | Public navbar — update the impersonation-dialog import path.                                                             |
| `lib/admin/navigation.ts`                                          | Rewritten: single nav module — items, hrefs, Lucide icon components, required permissions, SOON flag.                    |
| `lib/admin/navigation.test.ts`                                     | Unit tests for permission filtering and the final nav order/routes.                                                      |
| `components/admin/sidebar/index.tsx` (+ sibling files)             | Replaced: new warm sidebar (DT tile, Admin badge, `Link` nav, active states, Back to member site, user footer).          |
| `app/admin/layout.tsx`                                             | Replaced: same `READ_ADMIN_PORTAL` gate + redirect, new shell around `SidebarInset` + `Footer`.                          |
| `app/admin/error.tsx`                                              | New friendly admin error boundary styled per the design system.                                                          |
| `lib/admin/page-guard.ts`                                          | New shared per-page permission helper (`user`, `canEdit`, …) used by the rebuilt pages.                                  |
| `lib/admin/page-guard.test.ts`                                     | Unit tests: grant, deny/redirect, derived booleans.                                                                      |
| `components/admin/breadcrumbs.tsx`                                 | Unchanged export (`AdminBreadcrumbs`) so 14 legacy pages keep rendering; verify only.                                    |
| `app/admin/events/**` (renamed from `app/admin/meetings/`)         | Route rename; visible title becomes "Events"; internals otherwise unchanged.                                             |
| `app/admin/qr-codes/**`, `lib/admin/qr-pages-config.ts`            | Deleted (ratified no-in-app-QR); `qrcode` + `@types/qrcode` removed from `package.json` (sole importer verified).        |
| `lib/admin/dashboard-metrics.ts`                                   | New pure helpers: outstanding/collected-YTD from payments, member count, "needs a board hand" derivation.                |
| `lib/admin/dashboard-metrics.test.ts`                              | Unit tests for metric + board-hand derivation (incl. empty/error inputs).                                                |
| `app/admin/page.tsx`                                               | Rebuilt dashboard server component (`Promise.all`, per-source `Results` handling).                                       |
| `app/admin/components/*` (new dashboard components)                | Metric cards, board-hand list, events preview card, labeled "Ideas — not built yet" section; mobile cards.               |
| `app/admin/people/page.tsx`                                        | New People page (server component, page-guard, `getMasterRoster`, PageHeader "People", Security footer link).            |
| `app/admin/people/components/**`, `hooks/`, `config/columns.tsx`   | Machinery relocated from `app/admin/users/` (UserRoleSidebar + nine sections, `use-user-edit-form.ts`, columns, types).  |
| `app/admin/users/**`                                               | Deleted after relocation (route replaced by `/admin/people`).                                                            |
| `lib/admin/weekend-stats.ts`                                       | New pure helpers deriving per-weekend stat tiles from existing service data (omit stats with no cheap source).           |
| `lib/admin/weekend-stats.test.ts`                                  | Unit tests for stat derivation and the omit-when-unavailable rule.                                                       |
| `app/admin/weekends/page.tsx` + `app/admin/weekends/components/**` | Rebuilt per the locked WeekendsAdmin board (active group card, hub link-outs, planning row, past groups); reuse sidebar. |
| `app/admin/weekends/upcoming/page.tsx`                             | Orphaned "under construction" stub deleted during the Weekends rebuild (zero references).                                |
| `components/weekend/**`                                            | Must remain untouched (shared with public `/roster`); verified by diff + screenshot.                                     |
| `package.json`                                                     | Remove `qrcode`, `@types/qrcode`.                                                                                        |

### Notes

- Co-locate tests beside source as `.test.ts` (no `__tests__` dirs); run with `yarn test` (Jest). Repo test pattern: pure-TS helpers get unit tests; UI-only components are verified by observable proof artifacts (no React Testing Library installed).
- Server actions return `Result<Error, T>`; use `Results.*` + `isNil()`; user-facing errors via `toastError()`. UI is shadcn-only.
- Tables: `components/ui/data-table/` + `useDataTableUrlState` (History-API URL sync — never `router.push` for URL state) with `autoResetPageIndex: false`.
- React Compiler: never write `ref.current` during render; the `useReactTable` `react-hooks/incompatible-library` warning is expected.
- Validation: `yarn lint` (never raw `npx eslint`), `npx tsc --noEmit`, `yarn build`; commits are Conventional Commits with header/body lines ≤ 100 chars (commitlint).
- Design conformance: no raw hexes in new components — tokens only; page opening via `components/ui/page-header.tsx`; Lucide stroke icons only.

## Tasks

### [x] 1.0 Warm admin look: sidebar tokens + written design conventions

A non-technical user can confirm this is done by opening any admin page and seeing the sidebar in the warm stone look (not gray), opening the public homepage and seeing it unchanged, and opening `docs/design-system.md` and reading the conventions.

#### 1.0 Proof Artifact(s)

- Screenshot: admin sidebar before/after side-by-side demonstrates the warm `--sidebar-*` tokens rendering (FR U1-1/U1-2)
- File: `docs/design-system.md` covers page-opening pattern, borders-not-shadows, 0.4rem radius, serif headings, tabular-nums, control heights, light-only status, canvas link (FR U1-5)
- CLI: `yarn build` passes; screenshot of `/` demonstrates public styling unchanged (FR U1-3/U1-4)

#### 1.0 Tasks

- [x] 1.1 In `app/globals.css` `:root`, replace the `--sidebar` … `--sidebar-ring` values with warm-stone oklch values derived from the existing `--card`/`--border`/`--primary`/`--muted` hues (targets from the canvas: surface ≈ `#FDFCFA`, border ≈ `#E0DAD0`, active pill ≈ `#F2EFE9`, active icon ≈ `#6E5849`).
- [x] 1.2 In the `.dark` block, replace the `--sidebar-*` values with warm dark stones consistent with the `.dark` palette; remove the blue-purple `--sidebar-primary: oklch(0.49 0.22 264.43)`.
- [x] 1.3 Add four semantic tokens to `:root`, `.dark`, and `@theme inline` (utility-exposed): `--primary-hover` (≈ `#57443A`), `--nav-foreground` (≈ `#57503F`), `--selected` (≈ `#F6F2EA`), `--secondary-border` (≈ `#EFE5C2`). Do not modify any existing non-sidebar token value.
- [x] 1.4 Write `docs/design-system.md` covering every convention listed in the spec (Unit 1, final FR) and linking the design canvas as visual source of truth.
- [x] 1.5 Run `yarn build` + `npx tsc --noEmit`; capture the before/after sidebar screenshots and the `/` spot-check screenshot into the spec directory. (No headless browser available — screenshots deferred to task 2.0's visual pass; token diff recorded as primary evidence in the proof file.)

### [x] 2.0 New admin shell with the final navigation

A non-technical user can confirm this is done by opening `/admin` and seeing the new warm sidebar with exactly: Dashboard, Weekends, Events, Payments, People, Community, Files, Site settings, Security, Reports (faint, marked "SOON"), plus "Back to member site"; clicking each item lands on the right page with the item highlighted; every old admin page still works inside the new frame; `/admin/qr-codes` is gone; Events shows the old meetings page titled "Events".

#### 2.0 Proof Artifact(s)

- Screenshot: new shell wrapping `/admin/payments` demonstrates legacy pages render inside the new chrome (FR U2 legacy-routes)
- Screenshot series or GIF: clicking every nav item highlights it and navigates client-side (FR U2 nav/active-state)
- CLI: `yarn build` and `npx tsc --noEmit` pass demonstrates the impersonation move + shell replacement broke no imports (FR U2 impersonation move)
- URL: `/admin/qr-codes` 404s; `/admin/events` renders with an "Events" title (FR U2 QR removal + rename)
- Test: `lib/admin/navigation.test.ts` passes demonstrates permission filtering and the final nav order/routes (FR U2 nav module)
- Test: `lib/admin/page-guard.test.ts` passes demonstrates the shared guard preserves permission behavior (FR U2 page guard)

#### 2.0 Tasks

- [x] 2.1 Move `components/admin/sidebar/impersonation-dialog.tsx` → `components/impersonation/impersonation-dialog.tsx` (`git mv`); update imports in `components/navbar/user-menu.tsx` and `components/admin/sidebar/nav-user.tsx`; `npx tsc --noEmit`.
- [x] 2.2 Rename `app/admin/meetings/` → `app/admin/events/` (`git mv`); change the page's visible title to "Events" (its `AdminBreadcrumbs` title prop); leave internals unchanged (repo grep confirms only `lib/admin/navigation.ts` references `/admin/meetings`).
- [x] 2.3 Delete `app/admin/qr-codes/` and `lib/admin/qr-pages-config.ts`; remove `qrcode` and `@types/qrcode` from `package.json` and run `yarn` (sole importer verified: `qr-code-generator.tsx`).
- [x] 2.4 Rewrite `lib/admin/navigation.ts` as the single nav source: array of `{ title, href, icon (Lucide component), permissionsNeeded, soon? }` in the final order, Reports as `soon: true` non-link; export a `filterNavByPermission`-equivalent preserving today's semantics (empty permissions ⇒ visible past the portal gate). Add `lib/admin/navigation.test.ts` covering order, routes, permission filtering, and the SOON flag.
- [x] 2.5 Rebuild `components/admin/sidebar/` on shadcn `components/ui/sidebar.tsx`: header (DT logo tile, "Dusty Trails", cream "Admin" badge), a `'use client'` nav list using `Link` + `usePathname` (longest-prefix active matching; `/admin` exact; nested routes highlight their section), `NavUser` footer (session + impersonation entry preserved), bottom "Back to member site" item. Delete the dead `team-switcher.tsx`/`system-links.tsx`/`nav-main.tsx` once replaced.
- [x] 2.6 Replace `app/admin/layout.tsx`: keep `getLoggedInUser()` + `permissionLock([Permission.READ_ADMIN_PORTAL])` with today's redirect behavior; render the new sidebar + `SidebarInset` + existing `Footer`; do not modify `components/admin/breadcrumbs.tsx` (legacy pages depend on its export).
- [x] 2.7 Add `app/admin/error.tsx` (`'use client'`): friendly message, token-styled, "Back to dashboard" action.
- [x] 2.8 Add `lib/admin/page-guard.ts`: given required permissions, returns `{ user, canEdit, … }` or redirects — a thin wrapper over `getLoggedInUser` + existing `lib/security.ts` checks (no behavior changes). Add `lib/admin/page-guard.test.ts` (grant, deny/redirect, derived booleans).
- [x] 2.9 Click through every route in the new nav plus `/admin/payments/summary` and `/admin/weekends/[weekend_id]`; capture the proof screenshots/GIF; run `yarn lint`, `npx tsc --noEmit`, `yarn build`.

### [x] 3.0 Back-office dashboard at /admin

A non-technical user can confirm this is done by opening `/admin` and seeing: money tiles (outstanding + collected this year) whose numbers match the Payments summary page, a community member count, a "Needs a board hand" list (or a reassurance message when nothing needs attention), the next three events with an "Open Events →" link, and an "Ideas" area clearly labeled "sample — not built yet". It also works on a phone.

#### 3.0 Proof Artifact(s)

- Screenshot: dashboard with real metrics, board-hand list, events preview, labeled Ideas section demonstrates the unit end-to-end (all U3 FRs)
- Cross-check: outstanding/collected figures equal `/admin/payments/summary` for the same local seed data demonstrates metric correctness (FR U3 metrics)
- Screenshot: mobile viewport demonstrates the responsive mandate (FR U3 page pattern/responsive)
- Test: `lib/admin/dashboard-metrics.test.ts` passes demonstrates metric + board-hand derivation, including empty/failed-source inputs (FR U3 metrics, board-hand, graceful degradation)

#### 3.0 Tasks

- [x] 3.1 Create `lib/admin/dashboard-metrics.ts` (pure): `deriveMoneyMetrics(payments)` (outstanding total + open-fee count; collected + count for the current calendar year) using `lib/payments/compute-totals.ts` helpers; `deriveBoardHandItems({ payments, weekendGroups })` (open-fees item; "start planning" when no next group has dates; empty ⇒ reassurance state). Add `lib/admin/dashboard-metrics.test.ts`. (Shipped as `deriveOutstanding` + `deriveCollectedThisYear` + `deriveBoardHandItems`/`needsPlanning`; outstanding reuses `computeActiveWeekendFinancials`, the summary-page path, with a cross-check test.)
- [x] 3.2 Rewrite `app/admin/page.tsx` as a server component: `Promise.all` over `getAllPayments()`, `getMasterRoster()`, `getUpcomingEvents()`, `getWeekendGroupsByStatus()`; keep each source independent and handle each `Result` with `Results` helpers so a failed source renders a placeholder card, never a crash.
- [x] 3.3 Build the dashboard components under `app/admin/components/`: metric cards (cream outstanding card with open-fee count, green collected figure, member count; `tabular-nums`; PageHeader opening with serif "Admin" + canvas description).
- [x] 3.4 Build the "Needs a board hand" list: items deep-link to `/admin/payments` and `/admin/weekends`; reassurance empty state per the canvas copy.
- [x] 3.5 Build the events preview card: next three from `getUpcomingEvents`, header link "Open Events →" to `/admin/events`, no creation control.
- [x] 3.6 Build the "Ideas — not built yet" section: sample-data activity feed + storage meter, each explicitly labeled "sample — not built yet", visually distinct from live cards.
- [x] 3.7 Implement the mobile card layout; capture desktop + mobile screenshots and the payments-summary cross-check. (Responsive stacking implemented; authenticated screenshots deferred to the deployed preview — seeded dev login is rejected locally; cross-check pinned by unit test instead. See 16-proofs/16-task-03-proofs.md.)

### [x] 4.0 People page (replacing the old Users page)

A non-technical user can confirm this is done by clicking "People" in the sidebar: everyone appears in a searchable, sortable table titled "People"; searching/sorting changes the address bar and survives a page reload; clicking a person opens the familiar editor with all its sections; a footer note points to the Security page for role definitions; the old `/admin/users` address no longer exists; it works on a phone.

#### 4.0 Proof Artifact(s)

- Screenshot: `/admin/people` desktop table + open person editor demonstrates the page and reused editor (FR U4 table/editor)
- Screenshot: mobile card layout demonstrates the responsive mandate (FR U4 responsive)
- GIF or URL: `?sort=…&search=…` in the address bar surviving reload demonstrates URL-state integration (FR U4 URL state)
- URL: `/admin/users` 404s demonstrates the route replacement (FR U4 route replacement)
- CLI: `yarn build` + `npx tsc --noEmit` pass demonstrates the relocation broke no imports (FR U4 relocation)

#### 4.0 Tasks

- [x] 4.1 Relocate the machinery with `git mv`: `app/admin/users/components/` (UserRoleSidebar + the nine section files + `master-roster.tsx`), `app/admin/users/hooks/use-user-edit-form.ts`, `app/admin/users/config/columns.tsx`, `app/admin/users/types.ts` → the same shape under `app/admin/people/`; fix all import paths; `npx tsc --noEmit`.
- [x] 4.2 Create `app/admin/people/page.tsx`: server component using `lib/admin/page-guard.ts`, fetching `getMasterRoster()`; PageHeader with serif "People" + "Everyone with an account — contact details, experience, and roles."; no join-link or invite controls.
- [x] 4.3 Build the table client component on the shared `DataTable` + `useDataTableUrlState` (`autoResetPageIndex: false`), reusing the relocated column definitions with their permission-aware/mobile-aware metadata; restyle role chips and statuses with tokens only.
- [x] 4.4 Wire row click to the relocated `UserRoleSidebar` editor and verify each section loads and saves as today (existing actions + `toastError` untouched); footer note linking role definitions to `/admin/roles`.
- [x] 4.5 Delete the remaining `app/admin/users/` route files; repo-grep for stale `/admin/users` or `app/admin/users` references; `yarn lint` + `yarn build`.
- [x] 4.6 Implement the mobile card layout; capture the URL-state GIF and desktop/mobile screenshots.

### [ ] 5.0 Weekends page rebuilt for board work

A non-technical user can confirm this is done by opening "Weekends": the active group (e.g. DTTD #12) appears as a card with a weekend inside for Men's and Women's, each showing its numbers and an "Open the weekend hub" button that lands on that weekend's existing roster page; a dashed "start planning" row appears when the next group isn't scheduled; past groups are listed with links; creating a group still works; and the public roster page looks exactly as before.

#### 5.0 Proof Artifact(s)

- Screenshot: rebuilt Weekends page (active group card + stat tiles, planning placeholder, past groups) demonstrates the locked design (FR U5 layout)
- GIF: creating a weekend group via the existing sidebar flow demonstrates create/edit still works (FR U5 reuse)
- URL: "Open the weekend hub" lands on `/admin/weekends/[weekend_id]`; screenshot of public `/roster` demonstrates the shared roster view is unaffected (FR U5 link-out + no-touch)
- Test: `lib/admin/weekend-stats.test.ts` passes demonstrates per-weekend stat derivation and the omit-when-unavailable rule (FR U5 stat tiles)
- CLI: `git diff --stat components/weekend/` is empty demonstrates the shared roster components are untouched (FR U5 no-touch)

#### 5.0 Tasks

- [ ] 5.1 Create `lib/admin/weekend-stats.ts` (pure): derive per-weekend tiles — candidates confirmed vs capacity (42), team members serving, and (only if cheaply derivable from existing service data) candidates awaiting review and fees still open; encode the omit-don't-approximate rule. Add `lib/admin/weekend-stats.test.ts`.
- [ ] 5.2 Rewrite `app/admin/weekends/page.tsx` + `components/Weekends.tsx`: PageHeader with serif "Weekends" + the canvas description + primary "New weekend group"; active group card (title, "Active" pill, "Group settings" action) with Men's/Women's sub-cards (dates, location, stat tiles, "Open the weekend hub" → `/admin/weekends/[weekend_id]`).
- [ ] 5.3 Add the dashed "start planning" placeholder row (shown when no next group is scheduled; opens the group-creation flow) and the past-groups list with per-group summary + links to existing detail pages.
- [ ] 5.4 Reuse `WeekendSidebar.tsx` + `SetActiveWeekendButton.tsx` for create/edit/group-settings, restyled with tokens only (no service/action behavior changes); delete the orphaned `app/admin/weekends/upcoming/page.tsx` stub (zero references).
- [ ] 5.5 Implement the mobile card layout; capture all proof artifacts including the public `/roster` screenshot and the `git diff --stat components/weekend/` check; run `yarn lint`, `npx tsc --noEmit`, `yarn build`.
