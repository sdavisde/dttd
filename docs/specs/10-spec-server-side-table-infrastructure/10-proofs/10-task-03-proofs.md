# Task 3.0 Proof Artifacts — Candidate List Migration to TanStack Table

## Code Evidence

### `app/(public)/candidate-list/config/columns.tsx` (New)

- Defines `candidateColumns: ColumnDef<HydratedCandidate>[]` — 14 columns ported from old config
- Each column uses `accessorFn` (ported from old `accessor` functions), `DataTableColumnHeader` for sortable headers
- Column `meta` includes: `requiredPermission`, `showOnMobile`, `mobileLabel`, `mobilePriority`
- Name column: `mobilePriority: 'primary'`, renders with `font-medium`
- Church/payment columns: `mobilePriority: 'secondary'`
- All other columns: `mobilePriority: 'detail'`
- Payment column: conditional coloring (green for "Paid", red for "Unpaid")
- Age column: custom numeric `sortingFn` for proper numeric sorting
- Exports `candidateGlobalFilterFn` that searches across: candidate name (first+last and sponsorship name), email, phone, sponsor name, church, sponsor church — matching the exact search behavior from old `useCandidateList`
- Preserves legacy exports (`CANDIDATE_COLUMNS`, `CandidateColumnConfig`, `getDesktopColumns`, `filterColumnsByPermissions`) for `csv-export.ts` compatibility

### `app/(public)/candidate-list/components/CandidateListTable.tsx` (Rewritten)

- Uses `DataTable` from shared infrastructure
- Calls `useDataTableUrlState` with `defaultSort: [{ id: 'name', desc: false }]`, `defaultPageSize: 25`
- Pre-filters candidates to exclude `rejected` and `sponsored` statuses
- Passes `candidateGlobalFilterFn` for custom global search
- Custom `searchPlaceholder`: "Search by name, email, phone, sponsor, or church..."
- Empty states: "No candidates for this weekend." (no data), "No candidates found matching your search." + "Clear filters" button (no results)

### Deleted Files

- `app/(public)/candidate-list/hooks/use-candidate-list.ts` — Removed (replaced by TanStack Table + `useDataTableUrlState`)
- `app/(public)/candidate-list/config/columns.ts` — Removed (replaced by `columns.tsx`)

### Preserved Files (No Changes Needed)

- `app/(public)/candidate-list/page.tsx` — Server component unchanged, still passes `candidates` and `user`
- `app/(public)/candidate-list/utils/csv-export.ts` — Still imports from `../config/columns` (resolves to new `.tsx`)
- `app/(public)/candidate-list/components/ExportButton.tsx` — Unchanged
- `app/(public)/candidate-list/components/ShareButton.tsx` — Unchanged
- `hooks/use-table-pagination.ts` — Preserved for non-migrated tables

## CLI Output

### `yarn build`

```
$ next build
✓ Compiled successfully in 9.8s
✓ Generating static pages using 7 workers (42/42) in 438.5ms
Done in 32.07s.
```

## Verification

- [x] TanStack Table column definitions created with all 14 columns ported
- [x] DataTableColumnHeader used for all column headers (sortable)
- [x] Permission-based column visibility via `meta.requiredPermission`
- [x] Custom global search matching existing behavior (name, email, phone, sponsor, church)
- [x] Numeric sort for age column
- [x] Status pre-filter (excludes rejected/sponsored)
- [x] URL state persistence via `useDataTableUrlState`
- [x] Empty states with contextual messages and clear filters button
- [x] Old `useCandidateList` hook deleted
- [x] Old `columns.ts` deleted
- [x] Legacy exports preserved for CSV export compatibility
- [x] `yarn build` compiles successfully with no TypeScript errors
