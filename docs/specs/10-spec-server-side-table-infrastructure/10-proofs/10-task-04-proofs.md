# Task 4.0 Proof Artifacts: Per-Column Filters and Desktop Toolbar

## CLI Output

### Build Verification

```
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 9.4s
✓ Generating static pages using 7 workers (42/42) in 418.9ms
Done in 32.20s.
```

No TypeScript errors. Build passes cleanly.

## Code Evidence

### New Files Created

1. **`components/ui/data-table/data-table-column-filter.tsx`**
   - Exports `DataTableColumnFilter<TData, TValue>` component
   - Reads `column.columnDef.meta?.filterType` to decide mode
   - **Text mode**: `Input` inside `Popover`, calls `column.setFilterValue(value || undefined)`
   - **Select mode**: Checkbox list with faceted unique values + counts via `column.getFacetedUniqueValues()`
   - Multiple values selectable (OR logic, stored as `string[]`)
   - Search input within select popover for long option lists (shown when >5 options)
   - Active filter indicator: `text-primary` class on `ListFilter` icon
   - Clear button at bottom of popover

2. **`components/ui/data-table/data-table-toolbar.tsx`**
   - Exports `DataTableToolbar<TData>` component
   - Renders `DataTableSearch` on the left
   - Shows active filter count with `Badge variant="secondary"` (e.g., "2 filters")
   - "Clear all" button resets both `table.resetColumnFilters()` and `table.setGlobalFilter('')`
   - Only shows filter count + clear when filters are active

### Modified Files

3. **`components/ui/data-table/data-table-column-header.tsx`**
   - Updated to show `DataTableColumnFilter` popover when `column.columnDef.meta?.filterType` is defined
   - Filter icon positioned to the right of sort button
   - Active filter shown with `text-primary` color on the `ListFilter` icon
   - Non-sortable columns with filters still show filter icon

4. **`components/ui/data-table/data-table.tsx`**
   - Replaced `DataTableSearch` with `DataTableToolbar`
   - Added `arrIncludesFilter` function for select-type columns (array includes logic with `autoRemove`)
   - Auto-assigns `arrIncludesFilter` to columns with `meta.filterType === 'select'` via `processedColumns` memo
   - Wires `columnFilters`/`onColumnFiltersChange` through URL state when available, falls back to internal state

5. **`hooks/use-data-table-url-state.ts`** — **Major refactor: History API replaces Next.js router**
   - Added `columnFilters` and `onColumnFiltersChange` to `DataTableUrlState` interface
   - Parses `filter.{columnId}` URL params on mount (comma-separated → `string[]`, single → `string`)
   - Serializes column filter changes to URL params as `filter.{columnId}=val1,val2`
   - **Architecture change**: Replaced `router.push()`/`router.replace()` with `window.history.pushState()`/`replaceState()` for all URL updates. This eliminates the full Next.js server re-render cycle that was causing ~1s input lag on every keystroke. URL updates are now zero-cost (no re-render, no server round-trip).
   - `useSearchParams()` used only for hydration-safe initial parse; after mount, local `useState` is the source of truth
   - Removed `lodash` debounce dependency — no longer needed since state updates are instant
   - Added `popstate` event listener for back/forward navigation (re-parses URL → updates local state)
   - Search uses `replaceState` (no history pollution while typing); sort/page/filters use `pushState` (back/forward works)
   - Resets pagination when column filters, sorting, or search change

6. **`app/(public)/candidate-list/config/columns.tsx`**
   - Added `filterType: 'text'` to name column meta
   - Added `filterType: 'text'` to sponsor column meta
   - Added `filterType: 'text'` to church column meta
   - Added `filterType: 'select'` to payment column meta

7. **`components/ui/data-table/index.ts`**
   - Re-exports `DataTableColumnFilter` and `DataTableToolbar`

## Verification

### Proof Artifact Mapping

| Spec Requirement                                                             | Evidence                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --- | ----------- |
| Filter icon on filterable column header opens popover                        | `data-table-column-header.tsx` renders `DataTableColumnFilter` popover when `filterType` defined                         |
| Select filter shows unique values with counts via `getFacetedUniqueValues()` | `data-table-column-filter.tsx` `SelectFilter` uses `column.getFacetedUniqueValues()`                                     |
| Multiple values selectable (OR within column)                                | `SelectFilter` stores `string[]` via `column.setFilterValue()`, `arrIncludesFilter` checks `filterValue.includes(value)` |
| Text filter applies via `column.setFilterValue()`                            | `TextFilter` calls `column.setFilterValue(e.target.value                                                                 |     | undefined)` |
| Active filter visual indicator                                               | Filter icon uses `text-primary` class when `column.getFilterValue() !== undefined`                                       |
| `DataTableToolbar` with search + active filter count + "Clear all"           | `data-table-toolbar.tsx` renders search, badge count, and clear-all button                                               |
| Candidate List: `select` on payment, `text` on name/church/sponsor           | `columns.tsx` updated with `filterType` on those columns                                                                 |
| Filter state in URL (`filter.payment=Paid,Unpaid`)                           | `use-data-table-url-state.ts` serializes/parses `filter.*` params                                                        |
| `yarn build` compiles successfully                                           | Build output shows `✓ Compiled successfully` with no errors                                                              |
