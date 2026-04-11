# Task 5.0 — Draft Finalization & Removal Flows

## Summary

Implemented the full draft lifecycle UI: finalization with confirmation dialog, draft removal (instant), and finalized member management with "Dropped" and "Remove" options via dropdown menu. All flows use optimistic UI with rollback on failure.

## Changes Made

### Repository Layer (`services/weekend/repository.ts`)

- **`dropWeekendRosterMember(rosterId)`** — Updates `weekend_roster.status` to `'drop'`
- **`deleteWeekendRosterMember(rosterId)`** — Hard deletes the `weekend_roster` row

### Service Layer (`services/roster-builder/roster-builder-service.ts`)

- **`dropFinalizedRosterMember(rosterId)`** — Delegates to repository drop function
- **`removeFinalizedRosterMember(rosterId)`** — Delegates to repository delete function

### Actions Layer (`services/roster-builder/actions.ts` + `index.ts`)

- Exported `dropFinalizedRosterMember` and `removeFinalizedRosterMember` server actions

### UI: `FilledSlotCard` (`components/slot-cards.tsx`)

- **Draft cards**: X button for instant removal (no confirmation) + "Finalize" button with AlertDialog confirmation: "Have you personally confirmed that [Name] has accepted the [Role] position?"
- **Finalized cards**: X button replaced with DropdownMenu (`MoreVertical` icon) containing "Dropped" (amber) and "Remove" (destructive red) options

### Board Component (`roster-builder-board.tsx`)

- **`handleFinalize`** — Optimistically updates draft → finalized, calls `finalizeDraftRosterMember`, shows success toast, rollback on error
- **`handleDrop`** — Optimistically clears slot, calls `dropFinalizedRosterMember`, rollback on error
- **`handleRemove`** — Now handles both draft and finalized: calls `removeDraftRosterMember` or `removeFinalizedRosterMember` accordingly

### `KanbanColumn` (`components/kanban-column.tsx`)

- Added `onFinalize` and `onDrop` props, passed through to `FilledSlotCard`

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

### Proof Artifact 1 — Finalize button with confirmation dialog

Draft cards display a "Finalize" button with emerald styling. Clicking it opens an AlertDialog asking "Have you personally confirmed that [Name] has accepted the [Role] position?" with Cancel and "Yes, Finalize" actions.

### Proof Artifact 2 — Draft → Finalized visual transition

After confirming finalization, the card optimistically transitions from draft styling (dashed border, primary/5 background) to finalized styling (solid border, bg-card). A success toast appears.

### Proof Artifact 3 — Draft removal (no confirmation)

Clicking the X button on a draft card instantly removes the member with no confirmation dialog. The slot returns to empty state.

### Proof Artifact 4 — Finalized member dropdown menu

Clicking the three-dot menu (MoreVertical) on a finalized card shows a dropdown with:

- "Dropped" (amber text, UserX icon) — sets `weekend_roster.status` to `'drop'`, member returns to pool
- "Remove" (destructive red, Trash2 icon) — deletes the `weekend_roster` row entirely, member returns to pool
