# Task 2.0 Proof Artifacts — URL State Persistence Hook

## Code Evidence

### `hooks/use-data-table-url-state.ts`

- Exports `useDataTableUrlState` hook and `DataTableUrlState` type
- Parses URL params on mount: `sort`, `dir`, `search`, `page`, `pageSize`
- Serializes state changes back to URL:
  - Sort: `?sort=columnId&dir=asc`
  - Search: `?search=value`
  - Pagination: `?page=N&pageSize=N`
- Uses `router.replace()` for search (no history pollution)
- Uses `router.push()` for sort and pagination (back/forward works)
- Resets pagination to page 1 when sort or search changes (deletes `page` param)
- Preserves existing non-table URL params (e.g., `weekend`, `weekendType`)

### `components/ui/data-table/data-table.tsx`

- Added optional `urlState?: DataTableUrlState` prop
- When `urlState` is provided, delegates sorting/globalFilter/pagination state to the hook
- When `urlState` is not provided, falls back to internal `useState` (backward compatible)
- Added `searchPlaceholder` prop for customizable search placeholder text

### `components/ui/data-table/index.ts`

- Re-exports `useDataTableUrlState` and `DataTableUrlState` type from barrel file

## CLI Output

### `yarn build`

```
$ next build
✓ Compiled successfully in 9.5s
✓ Generating static pages using 7 workers (42/42) in 409.2ms
Done in 31.28s.
```

## Verification

- [x] Hook created with full URL state sync (sort, search, pagination)
- [x] DataTable updated with backward-compatible `urlState` prop
- [x] Barrel exports updated
- [x] `yarn build` compiles successfully with no TypeScript errors
- [x] Existing DataTable usage remains backward compatible (no urlState = internal state)
