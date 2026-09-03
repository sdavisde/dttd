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
card-based mobile layout below it (see the responsive guidelines in `CLAUDE.md` and the
reference implementation in `app/admin/weekends/[weekend_id]/weekend-roster-table.tsx`).

## Color scheme status

**Light mode only.** A full warm-dark palette exists in `globals.css` (`.dark` block,
including the sidebar set) but nothing activates it — there is no theme provider or
toggle. Do not design against dark mode until it is deliberately turned on.

## Voice

Copy is plain and warm, written from the member's side of the screen ("You're all
caught up", "Send reminder"). Tres Dias terms are used where the community uses them
(Roster, Secuela); internal jargon and permission names never appear in UI copy.
