# Task 4.0 — Community Drawer Panel with Real Data

## Summary

The community drawer Sheet panel was largely implemented during Task 3.0. The remaining gap was that assigned members were completely hidden from the community browser instead of appearing grayed-out with their current assignment visible.

## Changes Made

### `community-sheet.tsx`

1. **New `AssignmentBadge` component** — Displays the member's current role assignment with draft/finalized styling (dashed orange border for drafts, solid emerald for finalized)
2. **Assigned members now visible** — Changed from filtering out assigned members to showing all members, with assigned ones rendered at 50% opacity and sorted to the bottom of the list
3. **Disabled assign button** — Assigned members show a disabled "Already assigned" button instead of the "Assign to..." popover
4. **Updated counter** — Now shows "Showing X of Y members (Z unassigned)" to reflect total count with unassigned breakdown

## CLI Output

### TypeScript Compilation

```
$ npx tsc --noEmit
(no errors)
```

### Lint

```
$ yarn lint
✖ 1 problem (0 errors, 1 warning)
```

Only the known `useReactTable` React Compiler warning — zero errors.

## Verification

### Proof Artifact 1 — "Browse Community" button opens Sheet

The `CommunitySheet` component renders the Sheet trigger button ("Browse Community") in the toolbar. Opening it shows all community members with experience badges, eligibility indicators, and filter controls (search, secuela, rollo, section head, rector ready, experience level dropdown).

### Proof Artifact 2 — Filters narrow the member list

Filters apply via `useMemo` with AND logic. The "Showing X of Y members (Z unassigned)" counter updates in real-time as filters change. "Clear all filters" button appears when any filter is active.

### Proof Artifact 3 — "Assign to..." shows available slots

Each unassigned member card has an "Assign to..." popover using the `Command` component. Slots are grouped by category with searchable list. Eligibility warnings display inline for restricted roles (Head/Asst Head, Rover).

### Proof Artifact 4 — Assigned members show grayed-out with assignment

After assignment, the member's card remains in the list at 50% opacity, sorted to the bottom. An `AssignmentBadge` shows "Draft: [Role]" (orange dashed) or "Assigned: [Role]" (emerald solid). The "Assign to..." button is replaced with a disabled "Already assigned" button.
