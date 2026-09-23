# DTTD Design System — Conventions

> **Visual source of truth:** the ["DTTD Redesign Concepts" canvas](https://claude.ai/code/artifact/8f6195af-bfe4-480d-8f81-deae6bf94f71).
> The canvas's Design System board defines the palette, type scale, components, and the
> "Twelve Rules of the House." If an implementation disagrees with that sheet, the sheet
> wins — or gets deliberately amended there first. This doc encodes the conventions that
> bind day-to-day frontend work in this repo.

## Tokens, not hexes

All colors come from the custom properties in `app/globals.css` (exposed as Tailwind
utilities through `@theme inline`). **New components must never use raw hex values** —
if a color you need has no token, add a semantic token first.

Notable tokens beyond the standard shadcn set:

| Token                                            | Use                                                             |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `--primary-hover`                                | Hover state for primary-brown links/buttons                     |
| `--nav-foreground`                               | Resting navigation text (quieter than `--foreground`)           |
| `--selected`                                     | Selected row/queue-item surface                                 |
| `--secondary-border`                             | Border for cream (`--secondary`) surfaces                       |
| `--sidebar-*`                                    | The admin sidebar surface set (warm stone, brown active states) |
| `--success` / `--warning` / `--info` / `--error` | Status colors; green also means "money in"                      |
| `--experience-level-{1,2,3}` (+`-fg`)            | Experience-level badges and charts                              |

## Page opening pattern

Every page opens the same way, in order:

1. Breadcrumb trail
2. Serif page title (`h1`)
3. One-line description in muted text
4. Actions, right-aligned

Use `components/ui/page-header.tsx` for the title/description/actions block and
`components/ui/typography.tsx` for headings generally (`h1`–`h4` render in the serif).

`AdminBreadcrumbs` (admin) and `MemberBreadcrumbs` (member) show a copy-link button beside
the current page, revealed on hover or focus (always visible on touch devices) — every page
gets it with no per-page wiring. Pass `shareable={false}` to opt a page out.

## Member shell

Signed-in pages live in the `app/(member)` route group and get the member shell from its layout:
a task-named sidebar on desktop (`components/member/sidebar`, collapsible to an icon rail, state
remembered in the `member_sidebar_state` cookie), a labeled bottom tab bar on phones
(`components/member/tab-bar.tsx`), and a 56px top bar with the jump-to-page search palette and
the account menu (`components/member/top-bar.tsx`). Navigation never hides behind a hamburger:
the tab bar carries the five primary destinations and everything else is reachable from Home or
the search (⌘K). The nav model is `lib/member/navigation.ts` — add or reorder items there, never
in the components.

Unauthenticated and candidate-facing routes (landing, sign in, join, candidate forms, candidate
payment) stay in `app/(public)` with a bare header.

Every member page opens inside `PageContent` (`components/member/page-content.tsx`, the shell's
one gutter; `size="narrow"` for forms and reading pages) with `MemberBreadcrumbs` above the
`PageHeader`. `MemberBreadcrumbs` renders the trail 13.5px muted, hides earlier crumbs on phones,
and carries the same copy-link button as the admin trail (`components/ui/breadcrumb-share-button`).

## Elevation: borders, not shadows

Surfaces are defined by `1px` borders (`--border`, inner dividers slightly lighter),
not drop shadows. The only sanctioned shadows are the focus ring
(`0 0 0 3px` at low alpha of the primary) and popovers/dialogs. If you're reaching for
`shadow-md` on a card, use a border instead.

## Shape and type

- **One radius everywhere:** `--radius: 0.4rem` (6.4px). Pills and avatars use full
  rounding. Don't introduce other radii.
- **Serif headings:** Fraunces (via `--font-serif`) for headings and stat figures;
  Source Sans 3 (`--font-sans`) for everything else. Uppercase section labels are
  12–13px, weight 600, letter-spaced, muted.
- **Numbers:** any numeric data in tables, stat tiles, or money figures uses
  `tabular-nums` (Tailwind: `tabular-nums` utility).

## Controls

- Desktop buttons and inputs run **36–38px** tall (34px allowed in dense table rows).
- Touch targets are at least **44px** on mobile; form-first pages and phone screens
  step controls up (inputs 48–52px, primary actions 48–54px).
- Icons are stroke-based Lucide components on the standard 24px grid. Never emoji.

## Responsive

Admin data displays ship the dual layout: the desktop table untouched at `md+`, and a
card-based mobile layout below it (see the responsive guidelines in `CLAUDE.md`). Most
tables get this for free from the shared `components/ui/data-table/data-table.tsx`, which
renders `data-table-mobile-card.tsx` below `md`. For a hand-rolled example (a table that
does not go through `DataTable`), see
`components/file-management/FileBrowserTable.tsx`.

## Color scheme status

**Light mode only.** A full warm-dark palette exists in `globals.css` (`.dark` block,
including the sidebar set) but nothing activates it — there is no theme provider or
toggle. Do not design against dark mode until it is deliberately turned on.

## Voice

Copy is plain and warm, written from the member's side of the screen ("You're all
caught up", "Send reminder"). Tres Dias terms are used where the community uses them
(Roster, Secuela); internal jargon and permission names never appear in UI copy.
