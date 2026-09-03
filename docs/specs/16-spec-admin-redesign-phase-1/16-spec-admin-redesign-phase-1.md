# 16-spec-admin-redesign-phase-1.md

## Introduction/Overview

Phase 1 of the DTTD admin redesign rebuilds the admin area's foundation around the ratified design canvas ("DTTD Redesign Concepts"): it encodes the warm design system into the codebase, replaces the admin shell (layout, sidebar, navigation) with a fresh implementation of the final information architecture, and rebuilds the three core pages — Dashboard, People, and Weekends. All other admin pages keep working unchanged under the new shell until their own redesign phases. Member-facing pages are untouched, so most users see no meaningful difference.

The backbone rule this phase implements: **Admin is the board's back office** (money, people, files, settings); weekend operations live on each weekend's own pages. Admin tools are weekend-agnostic — weekend is a column or filter, never the page's scope.

This spec deliberately contains **five demoable units** (above the usual 2–4): the product owner chose a single spec over a foundation/pages split.

## Goals

- Encode the canvas design system (warm sidebar tokens, missing semantic tokens, written conventions) into `app/globals.css` and a conventions doc, without altering tokens that public pages consume
- Replace the admin shell with the final navigation (Dashboard · Weekends · Events · Payments · People · Community · Files · Site settings · Security · Reports "SOON") using modern App Router patterns — `Link` navigation, `usePathname` active states, one icon map, an `error.tsx`
- Rebuild `/admin` as a real back-office dashboard: live money/people metrics, a "Needs a board hand" action list, an events preview, and clearly-labeled sample widgets for future ideas
- Ship a new `/admin/people` page (master-roster table + existing per-person editor, restyled) and a rebuilt `/admin/weekends` page (create/archive groups, link to each weekend's roster view)
- Keep every legacy admin page (payments, files, settings, meetings, community board, roles) fully functional under the new shell; remove the QR Codes page per the ratified no-in-app-QR decision

## User Stories

- **As a board member**, I want the admin landing page to show money and people at a glance so that I don't have to open three different pages to know whether anything needs my attention.
- **As a board member**, I want one People page with everyone's contact details, experience, and roles so that I can answer "who is this and what do they do" in one place.
- **As a board member**, I want the Weekends page to focus on creating and archiving weekend groups so that day-to-day weekend management stays with the people running each weekend.
- **As an admin**, I want the sidebar to highlight where I am and navigate without full page reloads so that the admin area feels like one coherent application.
- **As a member of the community**, I want the public site to keep working exactly as it does today so that the admin redesign doesn't disrupt my forms, payments, or roster access.

## Demoable Units of Work

### Unit 1: Design-System Pass

**Purpose:** Bring `app/globals.css` in line with the canvas Design System board so the admin shell and rebuilt pages can be styled entirely from tokens. Serves every later unit and every future redesign phase.

**Functional Requirements:**

- The system shall replace the neutral-gray light-mode `--sidebar-*` token values in `app/globals.css` (`:root`, lines with `--sidebar` through `--sidebar-ring`) with warm-stone values derived from the existing warm palette (`--background`/`--card`/`--border` hues, chroma > 0), matching the canvas sidebar (card `#FDFCFA`, border `#E0DAD0`, active pill `#F2EFE9`, active icon `#6E5849`)
- The system shall update the `.dark` `--sidebar-*` values to warm dark stones consistent with the existing `.dark` palette (removing the blue-purple `--sidebar-primary: oklch(0.49 0.22 264.43)`), even though dark mode remains unactivated
- The system shall add new semantic tokens (in `:root`, `.dark`, and the `@theme inline` block) for values the canvas boards use that have no token today, including at minimum: a primary-hover brown (`#57443A`), a nav-resting text color (`#57503F`), a selected-row surface (`#F6F2EA`), and a secondary/cream border (`#EFE5C2`) — named semantically (e.g. `--primary-hover`, `--selected`, `--secondary-border`), not by color
- The system shall not change the value of any existing token that public pages consume (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--border`, etc.) — the pass is additive plus the sidebar-token rewrite
- The system shall add a conventions document at `docs/design-system.md` covering: the page-opening pattern (breadcrumb → serif title → one-line description → actions right), borders-not-shadows elevation, the single 0.4rem radius, serif headings via `components/ui/typography.tsx` and `components/ui/page-header.tsx`, `tabular-nums` for numeric data, control heights (36–38px desktop, 44px+ touch targets), light-mode-only status, and a link to the design canvas as visual source of truth

**Proof Artifacts:**

- Screenshot: admin sidebar before/after side-by-side demonstrates the warm sidebar tokens rendering
- File: `docs/design-system.md` exists and covers the listed conventions
- CLI: `yarn build` passes demonstrating no CSS/token regressions; spot-check screenshot of one public page (e.g. `/`) demonstrates public styling is unchanged

### Unit 2: New Admin Shell

**Purpose:** Replace the admin layout, sidebar, and navigation config with a fresh implementation of the final IA, wrapping both new and legacy pages. Serves every admin user.

**Functional Requirements:**

- The system shall move `components/admin/sidebar/impersonation-dialog.tsx` to a neutral location (`components/impersonation/impersonation-dialog.tsx`) and update its imports in the public navbar (`components/navbar/user-menu.tsx`) and anywhere else it is used, **before** the shell is replaced
- The system shall replace `app/admin/layout.tsx`, `components/admin/sidebar/*`, and `lib/admin/navigation.ts` with a new shell rendering: a warm sidebar (shadcn `components/ui/sidebar.tsx` primitives) with the "DT" logo tile, "Dusty Trails" name, and a cream "Admin" badge; the nav items Dashboard (`/admin`) · Weekends (`/admin/weekends`) · Events (`/admin/events`) · Payments (`/admin/payments`) · People (`/admin/people`) · Community (`/admin/community-board`) · Files (`/admin/files`) · Site settings (`/admin/settings`) · Security (`/admin/roles`) · Reports (non-link with a faint "SOON" badge); and a "Back to member site" item at the bottom
- The system shall use Next.js `Link` components for all nav items (no raw `<a href>`) and derive the active item from `usePathname`, highlighting the current section including nested routes (e.g. `/admin/weekends/[id]` highlights Weekends)
- The system shall define nav items, their icons (Lucide components, one map, no string indirection duplicated across files), and their required permissions in a single module, filtered by the signed-in user's permissions as today (`filterNavByPermission` behavior preserved)
- The system shall preserve the `READ_ADMIN_PORTAL` permission gate in the new `app/admin/layout.tsx` with the same redirect behavior as today
- The system shall provide a shared per-page permission helper (e.g. `lib/admin/page-guard.ts`) that returns the logged-in user plus derived booleans (`canEdit`, etc.) for a required permission set, and use it in the pages this spec rebuilds; legacy pages may adopt it later
- The system shall add `app/admin/error.tsx` rendering a friendly error state styled per the design system
- The system shall keep the `AdminBreadcrumbs` component exported from `components/admin/breadcrumbs.tsx` (same name and props) so all 14 legacy pages continue to render without modification
- The system shall remove the QR Codes entry from navigation and delete `app/admin/qr-codes/` (page and generator); `lib/admin/qr-pages-config.ts` and the `qrcode` dependency shall be removed if nothing else imports them
- The system shall rename the meetings route to Events: `app/admin/meetings/` moves to `app/admin/events/`, the page's visible title becomes "Events", internal references to `/admin/meetings` are updated, and the page's internals are otherwise unchanged
- The system shall leave all legacy admin routes (`/admin/payments`, `/admin/payments/summary`, `/admin/files`, `/admin/settings`, `/admin/events`, `/admin/community-board`, `/admin/roles`, `/admin/weekends/[weekend_id]`) fully functional under the new shell

**Proof Artifacts:**

- Screenshot: new shell wrapping a legacy page (e.g. `/admin/payments`) demonstrates legacy pages render inside the new chrome
- Video/GIF or screenshot series: clicking every nav item navigates client-side and highlights the active item, demonstrating the IA and active states
- CLI: `yarn build` and `npx tsc --noEmit` pass demonstrating the impersonation move and shell replacement broke no imports
- URL: `/admin/qr-codes` returns 404 demonstrating the QR page removal; `/admin/events` renders the renamed events page with an "Events" title

### Unit 3: Dashboard

**Purpose:** Rebuild `/admin` (currently a link grid) into the board's back-office landing page per the AdminDashboard board. Serves board members.

**Functional Requirements:**

- The system shall display metric cards computed from real data: outstanding fees (total dollars + count of open fees, cream-styled) and collected this calendar year (dollars + payment count) via `getAllPayments` from `@/services/payment` and the helpers in `lib/payments/compute-totals.ts`; community member count via `getMasterRoster` from `@/services/master-roster`
- The system shall display a "Needs a board hand" list containing only computable items: open fees (linking to `/admin/payments`) and, when the next weekend group has no scheduled dates, a "start planning" item (linking to `/admin/weekends`); when nothing needs attention it shall show a reassurance empty state
- The system shall display an events preview card ("Coming up") listing the next three upcoming events via `getUpcomingEvents` from `@/services/events`, with a header link "Open Events →" to `/admin/events`; the card shall contain no event-creation control
- The system shall render a visually distinct "Ideas — not built yet" section containing sample-data mock widgets (at minimum: a recent-admin-activity feed and a file-storage meter), each explicitly labeled "sample — not built yet", to support brainstorming future dashboard work
- The system shall open with the standard page pattern (serif "Admin" title + description per the canvas) and follow the admin mobile-card responsive rules
- The system shall fetch all dashboard data in the server component via `Promise.all`, handling each `Result` with `Results` helpers (a failed source renders a graceful placeholder rather than crashing the page)

**Proof Artifacts:**

- Screenshot: dashboard showing real metrics, board-hand list, events preview, and the labeled Ideas section demonstrates the unit end-to-end
- Cross-check: outstanding/collected numbers match `/admin/payments/summary` for the same data demonstrates metric correctness
- Screenshot: mobile viewport demonstrates responsive layout

### Unit 4: People

**Purpose:** Ship `/admin/people` — the picked "master roster in the new skin" direction — as the admin's single who-is-everyone page. Serves board members and admins.

**Functional Requirements:**

- The system shall create `/admin/people` rendering the master-roster data (`getMasterRoster` from `@/services/master-roster`) in the shared `DataTable` (`components/ui/data-table/`) with URL-synced state via `hooks/use-data-table-url-state.ts` (History-API pattern, `autoResetPageIndex: false`)
- The system shall reuse today's column definitions from `app/admin/users/config/columns.tsx` (name, contact, community status, experience, roles as chips), restyled per the design system, with the existing permission-aware and mobile-aware column metadata preserved
- The system shall open the existing per-person editor (`app/admin/users/components/UserRoleSidebar.tsx` with `app/admin/users/hooks/use-user-edit-form.ts` and the section components) on row click — reused and restyled, not rewritten
- The system shall open with the standard page pattern: serif "People" title, description ("Everyone with an account — contact details, experience, and roles."), and a search input; it shall include no join-link or invite controls
- The system shall show a footer note linking role definitions to the Security page (`/admin/roles`)
- The system shall replace `/admin/users` with `/admin/people`: the reused machinery (`app/admin/users/config/columns.tsx`, `components/UserRoleSidebar.tsx` and its section components, `hooks/use-user-edit-form.ts`, `components/master-roster.tsx` as reference) relocates under `app/admin/people/`, the `app/admin/users/` route is deleted, and the sidebar People nav item points to `/admin/people`
- The system shall render the mobile card layout per the admin responsive rules, with search and filters working identically to desktop

**Proof Artifacts:**

- Screenshot: `/admin/people` desktop table and open person editor demonstrates the page and reused editor working
- Screenshot: mobile card layout demonstrates the responsive mandate
- Video/GIF or URL: sorting/searching updates the URL (e.g. `?sort=name&search=…`) and survives reload demonstrates URL-state integration

### Unit 5: Weekends

**Purpose:** Rebuild `/admin/weekends` per the locked WeekendsAdmin board: board work only (create, archive, link out), with day-to-day management on each weekend's own pages. Serves board members and weekend leadership.

**Functional Requirements:**

- The system shall display the active weekend group as a card (title, "Active" status pill, "Group settings" action) containing one sub-card per weekend (Men's/Women's) with date/location and stat tiles: candidates confirmed vs capacity, team members serving, candidates awaiting review, and fees still open — computed from existing sources (`getWeekendGroupsByStatus`/`getWeekendRoster` from `@/services/weekend`, candidate statuses, and `getAllPayments` totals); any stat without an existing cheap source shall be omitted rather than approximated
- The system shall render an "Open the weekend hub" action on each weekend sub-card linking to the existing `/admin/weekends/[weekend_id]` roster view
- The system shall render a dashed "start planning" placeholder row when no next weekend group is scheduled, opening the group-creation flow
- The system shall list past weekend groups with per-group summary and a link to their existing detail pages
- The system shall reuse the existing create/edit machinery (`app/admin/weekends/components/WeekendSidebar.tsx`, `SetActiveWeekendButton.tsx`, and the weekend services/actions) restyled to the design system — no changes to the weekend services' behavior
- The system shall not modify `components/weekend/WeekendRosterView` or anything under `components/weekend/roster-view/` (shared with the public roster page)
- The system shall open with the standard page pattern (serif "Weekends" title + the canvas description) and follow the admin mobile-card responsive rules

**Proof Artifacts:**

- Screenshot: rebuilt Weekends page showing active group card with stat tiles, planning placeholder, and past groups demonstrates the locked design implemented
- Video/GIF: creating a weekend group via the existing sidebar flow demonstrates create/edit still works
- URL: "Open the weekend hub" lands on the existing `/admin/weekends/[weekend_id]` page demonstrates the link-out behavior; screenshot of the public `/roster` page demonstrates the shared roster view is unaffected

## Non-Goals (Out of Scope)

1. **Member-side changes**: no changes to public pages, the member navigation concepts (VerbNav, Weekend Hub, Today home, phone screens), or the login page
2. **New Events page**: the calendar-based Events page from the canvas is a later phase; this phase only renames the legacy meetings page to `/admin/events` with an "Events" title, internals unchanged
3. **Community positions page**: the Community nav item points to the legacy `/admin/community-board` page
4. **Security page redesign**: role inheritance, grouped permission ladders, and copy-first creation are specced on the canvas but not built here; `/admin/roles` remains as-is
5. **Reports**: nav shows a non-interactive "SOON" badge only
6. **Join-link / invite logic**: no signup-link generation, no invite states anywhere
7. **Dark mode and comfort mode**: tokens may exist but no toggle or activation ships
8. **Weekend hub redesign**: `/admin/weekends/[weekend_id]` and the shared `WeekendRosterView` are untouched
9. **Permission model changes**: `lib/security.ts` (Permission enum, `CHA_ROLE_PERMISSIONS`, `permissionLock`, `userHasPermission`) is unchanged; the shared page helper wraps existing checks, never alters them
10. **Database changes**: no migrations, no schema or seed changes
11. **Legacy page redesigns**: payments, files, settings, meetings, community board, and roles pages are re-chromed by the new shell only — their internals are not restyled

## Design Considerations

The design canvas **"DTTD Redesign Concepts"** is the visual source of truth: https://claude.ai/code/artifact/8f6195af-bfe4-480d-8f81-deae6bf94f71 — the Design System board defines the palette, type scale, and "Twelve Rules"; if implementation disagrees with the sheet, the sheet wins or gets deliberately amended.

Boards binding each unit: **DesignSystem** (Unit 1), **PaymentsA** chrome / sidebar (Unit 2), **AdminDashboard** (Unit 3), **People** (Unit 4), **WeekendsAdmin** (Unit 5).

Key rules that bind this phase: every page opens breadcrumb → serif title → one-line description → actions right (use `components/ui/page-header.tsx` / `components/ui/typography.tsx`); elevation via 1px borders, not shadows; single 0.4rem radius; numeric data in `tabular-nums`; touch targets ≥ 44px; stroke-based Lucide icons only, never emoji; copy is plain and warm.

## Repository Standards

- **UI**: shadcn/ui components only (`components/ui/`); no other UI libraries
- **Data**: server components fetch via `services/` (repository → service → actions layering, `authorizedAction` for RBAC); server actions return `Result<Error, T>`; prefer `Results.unwrapOr`/`map`/`match`/`andThen`; `isNil` from lodash for null checks
- **Errors to users**: `toastError()` from `@/lib/toast-error` — never raw errors
- **Responsive**: all admin data displays implement the dual desktop-table / mobile-card layout (reference: `app/admin/weekends/[weekend_id]/weekend-roster-table.tsx`)
- **Tables**: `components/ui/data-table/` + `useDataTableUrlState` with History-API URL sync (never `router.push` for URL state), `autoResetPageIndex: false`
- **Validation**: `yarn lint` (never npx eslint), `npx tsc --noEmit` for quick type checks, `yarn build` to confirm compilation, `yarn test` with co-located `.test.ts` files (no `__tests__` dirs)
- **Commits**: conventional commits, body lines ≤ 100 chars (commitlint-enforced)

## Technical Considerations

- Server components by default; `'use client'` only where interactivity requires it (sidebar active state, dialogs, tables)
- Navigation uses `Link` + `usePathname`; the auth flow in `proxy.ts` / `lib/supabase/middleware.ts` is untouched
- `app/globals.css` is the single stylesheet for the whole app — Unit 1 must be additive (new tokens + `--sidebar-*` rewrite only); any change to shared token values would restyle public pages and is out of scope
- Tailwind v4 CSS-first theming: new tokens go in `:root`, `.dark`, and the `@theme inline` block so they are usable as utilities
- React Compiler gotchas (from project memory): never assign to a ref's `.current` during render (sync via `useEffect`); `useReactTable` triggers a known `react-hooks/incompatible-library` warning — expected, not an error
- React Query is mounted but effectively unused in admin; keep the existing pattern of server-component fetches + `router.refresh()` after mutations
- The dashboard should degrade gracefully: each data source is independent (per the separation-of-concerns convention — do not bundle unrelated fetches into one return type)

## Security Considerations

- The `READ_ADMIN_PORTAL` gate in the admin layout must be preserved with identical redirect behavior; the new shell must not widen access
- Per-page permission checks are preserved behavior-identically (via the shared helper on rebuilt pages, unchanged code on legacy pages); server actions keep their existing `authorizedAction` gates
- No changes to the permission model, roles, or session handling
- Proof-artifact screenshots must be taken against local seed data only — no real member PII (names, phones, medical info) in committed artifacts

## Success Metrics

1. **Zero legacy breakage**: every pre-existing admin route renders and functions under the new shell; the public site (roster, forms, payments) is visually and functionally unchanged (`yarn build` passes, spot-check screenshots)
2. **One-glance dashboard**: outstanding and collected totals on `/admin` exactly match the payments summary page for the same dataset
3. **IA complete**: all ten nav entries present with correct routing and active-state highlighting; QR Codes gone; Reports marked SOON
4. **Design conformance**: rebuilt pages pass a visual review against their canvas boards (chrome, page-opening pattern, tokens — no raw hexes in new components)
5. **Responsive mandate met**: Dashboard, People, and Weekends all render usable mobile card layouts

## Open Questions

1. If the "candidates awaiting review" or "fees still open" per-weekend stats prove expensive to derive from existing services, the Weekends stat tiles drop to the stats with cheap sources (candidates confirmed, team count) — flagged during implementation rather than blocking. (Resolved decisions folded into requirements: `/admin/users` is deleted in favor of `/admin/people`; the meetings page is renamed to `/admin/events` with an "Events" title.)
