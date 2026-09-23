# Redesign — Status Brief

_Status as of 2026-09-23._

## The plan

Reskin and restructure the app against one agreed set of designs, in two tracks: the **admin**
back office first, then the **member-facing** side. Member changes were deliberately deferred so
most users saw no difference during phase 1.

**Source of truth:** [DTTD Redesign Concepts](https://claude.ai/code/artifact/8f6195af-bfe4-480d-8f81-deae6bf94f71)
— a design canvas with one agreed board per screen, across three pages (Member screens / Admin
screens / Design system). The Design System board matches `app/globals.css`; conventions are
written up in [`design-system.md`](design-system.md). The canvas and its exported board HTML are
**not** in this repo.

"Board" in redesign commits means a canvas artboard (e.g. `PaymentsA`, `FilesAdmin`) — not the
community's governing board.

## Locked decisions (settled — don't re-litigate)

- **Admin = back office only.** Dashboard, Weekends (create/archive groups), Events, Payments,
  People, Community, Files, Site settings, Security, Reports. Admin tools are weekend-agnostic:
  weekend is a column or filter, never page scope.
- **Weekend operations live in the member shell**, on each weekend's hub pages — candidate review,
  roster builder, edit weekend. Never in Admin.
- **Management access is per feature**, not a single PWC gate. The model is the `Permission` enum
  and `CHA_ROLE_PERMISSIONS` in `lib/security.ts`.
- **People** = master-roster table + sectioned per-person editor; roles assigned there as chips.
  Primary action is "Copy join link" — an open join link, no per-person invitations.
- **Security** owns role creation and permissions. Roles are inheritable and **additive only**
  ("based on" another role; never subtracts).
- **Events** has its own admin page; the dashboard only previews the next three gatherings.
- **No in-app QR generation.** A shared copy/share-link button replaces it.
- **Candidate review** = Version A queue layout. **Files** = Drive-style folder browser.
- Light mode only for now.

## Admin track — design parity reached, not merged

All work is on `preview` (15 commits, `87fc0ef..89c050f`). `preview` is strictly ahead of `main`;
nothing has shipped to production. The Vercel preview deploy for `89c050f` succeeded.

| Pass                                                       | Scope                                                              | Commits                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Phase 1 ([spec 16](specs/16-spec-admin-redesign-phase-1/)) | Design tokens, new admin shell, Dashboard, People, Weekends        | `88b341f` `c747f43` `c81d1b8` `42e49ad` `2662477`           |
| Conformance rework                                         | People, Weekends, Dashboard restyled against the actual board HTML | `27641b7` `1ca00fb` `0eb5f3a`                               |
| Full-admin parity                                          | Events, Payments, Community, Files, Site settings, Security        | `1789c99` `821b8f2` `becdf49` `cef5add` `57abaca` `89c050f` |

Every task in spec 16 is checked. Phase 1 also removed `/admin/qr-codes` and the `qrcode`
dependency, moved `/admin/users` to `/admin/people`, and renamed `/admin/meetings` to
`/admin/events`.

Two admin routes were left alone on purpose:

- `/admin/weekends/[weekend_id]` — the old admin weekend hub (spec 16 non-goal); retired on 2026-09-23 in
  favour of the member hub at `/weekends/[groupId]`.
- `/admin/reports` — not built; the nav shows a SOON badge.

`app/(public)`, `components/weekend/**` and `components/file-management/**` are zero-diff against
`main` across the whole branch.

### Pre-merge batch (2026-09-21)

A board-vs-code audit found Security, Payments, Files, Site settings and the weekend hub furthest
from their boards. The owner chose "fixes + small features that need no new data" as the merge
bar. Landed on `preview` in `e8aa2c4..3c48549`:

- **Payments** — board header (Export CSV, Record a payment), three stat tiles, All / Outstanding /
  Paid / Waived control, Status column, filter chips, details dialog. Outstanding rows are
  calculated from the active weekend group, never stored. A **waived** fee (the generic name for
  a scholarship) is a ledger row with method `waived`, paid by the community, excluded from every
  "collected" total. Migration `20260921100000` widens the `payment_method` check. The summary
  sub-page is restyled and linked from the ledger footer until Reports exists.
- **Files** — one page at every depth with a folder rail, folders and files in one table, mobile
  cards; nested folders, the `avatars` bucket leak, create-folder and breadcrumbs fixed.
  **Per-file visibility levels are dropped** (owner decision).
- **Site settings** — both fees read-only from Stripe, editable system email address (verified
  domain only), two notification switches; all on the existing `site_settings` table.
- **Dashboard / Events** — storage as the fourth tile, calendar preview card, secuela action item;
  Events mobile agenda, derived meter total, "All events" toggle.
- **Shell / Weekends / hub** — copy-link button on every admin page header, board sidebar width
  and icons, skeleton loading state, "To review" stat, weekend hub in the standard admin frame
  with a reachable not-found page.
- **People / Community** — Copy join link; Community retitled, Change/Assign gated on
  `WRITE_USER_ROLES`, committees selected by role type.

None of it has been exercised in a browser yet.

### Second batch (2026-09-23), local commits `5450933..d947c90`

- **Security rebuilt** at `/admin/security` (`/admin/roles` redirects): two-pane list + inline
  editor, renameable roles with a required description, copy-first creation, additive
  "based on" inheritance (migration `20260923000000`, cycle-guard trigger), six No access /
  View / Manage ladders covering every permission exactly once (`lib/security/permission-areas.ts`),
  sensitive panel, admin-access switch, quarantined Full Access card. Inherited permissions reach
  `userHasPermission` via the user's expanded role set.
- **People editor** — inline 400px panel on `xl+` (sheet below), six collapsible cards, role
  chips + "Add role" picker, selected-row tint.
- **Community** — compact minutes list, member counts, "+ Add a committee or team" dialog.
- **Events** — element-level parity pass; New event sidebar fixed for phones.
- **Weekends "Fees open"** now reads the same per-person outstanding list as the dashboard and
  Payments. **Row action menus go in the first column** on every redesigned table (site rule).

### Remaining after the merge

- **Editable fees** — mint a new Stripe Price via the API, store its id, and rework the webhook's
  env-based price dispatch.
- **Non-payers** — spiritual directors show as Outstanding until a waived row is recorded; no
  role-based exemption exists.
- **Weekends** — "Active · registration open" needs a registration-state field; "View archive"
  and an explicit archive control.
- **Community** — term dates and a committee "lead" need columns (`user_roles` has neither).
- **Dashboard** — "Recent admin activity" (needs an audit log), "joined this year" (`users` has no
  `created_at`).
- **Email log** — a skipped send (notification switch off) writes no `email_log` row.
- **Prayer wheel links → weekend hub** — still not editable in the UI.
- **Reports** — the whole page; nav shows SOON, matching the board.
- Housekeeping: `react-select` is unused and can leave `package.json`; the rector-ready and
  experience-level sections in the People editor still use raw palette colors; `Results.logFailures`
  logs an error line for ok results too.

### Leftovers

- Seeded dev login is rejected by a local DB that predates the current `seed.sql`. Fix is an
  owner-run `yarn db:reset`.
- Open design-system questions: green is used for both community-event scope and paid/success;
  the rector-ready star is still `amber-500` because `--warning` is too pale at icon size.

## Member track — shell and hub landed, review next

The canvas has a Member screens page: VerbNav, Weekend Hub, Today home, phone screens, the member
sidebar and topbar (from the CandidateReviewA board), the phone tab bar (from Main).

**Shell (2026-09-23, on `preview`):** `app/(public)` was split into a bare public group (landing,
auth, candidate forms and payment) and `app/(member)`, whose layout renders the designed shell —
task-named collapsible sidebar, 56px top bar with a jump-to-page search palette and account menu,
labeled phone tab bar, `MemberBreadcrumbs` + `PageHeader` opening on every page, one gutter
(`PageContent`) and `min-w-0` containment so nothing spills horizontally. The mega-menu navbar is
gone. Page bodies were left as they were: the weekend hub (`/weekends/[groupId]`, absorbing
current-weekend, roster, candidate-list and review-candidates — old URLs removed, not redirected)
and the queue-layout candidate review are the next two chunks. Deferred by owner decision:
waitlist status, "Ask the sponsor", and the hub's Documents card.

**Weekend hub (2026-09-23, on `preview`):** `/weekends` lists every group (active first) and
`/weekends/[groupId]` is the hub — Overview (confirmed / 42, team serving, days until send-off,
fees outstanding for payments readers; Coming up; Your part in this weekend; prayer wheel),
Schedule (the existing calendar + list), Team (the existing roster view) and Candidates (the
existing candidate-info table), with the Men's / Women's switch as `?weekend=`. The cream strip
is per feature: Review candidates · N waiting, Roster builder, Edit weekend (→ Admin › Weekends
until a member-side editor exists). Retired outright: `/current-weekend`, `/roster`,
`/candidate-list`, `/admin/weekends/[weekend_id]`; the sidebar's Roster now opens the active
group's Team tab. Known gaps: no weekend location column (read from the weekend event), CHA-role
permissions only apply to the ACTIVE group, the roster builder and sponsor form still work on the
active group only.

Earlier public-side design commits predate the canvas and are not part of this track: `fc9c4f1`
landing redesign, `8964c88` home dashboard, `448bdc3` warm design foundation + profile settings.

## Next steps

1. Apply migration `20260921100000` locally, test the admin redesign on the `preview` deploy
   (nothing in the pre-merge batch has been run in a browser), then merge `preview` into `main`.
2. Owner-run `yarn db:reset` to restore the local seeded login.
3. Redraw the Security board, then write the member-side spec (spec 18) from the canvas.

## Related

[Spec 17](specs/17-spec-loading-states/) (loading states) is a separate performance track, but
some of its remaining tasks still point at `app/admin/users` and `app/admin/meetings`, which the
redesign renamed or deleted.
