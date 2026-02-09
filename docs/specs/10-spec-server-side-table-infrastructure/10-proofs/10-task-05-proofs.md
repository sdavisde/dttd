# Task 5.0 Proof Artifacts — Mobile Expandable Cards and Integrated Sort/Filter Controls

## CLI Output

### Build Verification

```
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 10.7s
✓ Generating static pages using 7 workers (42/42) in 448.3ms
Done in 29.57s.
```

No TypeScript errors. Build passes cleanly.

## Code: DataTableMobileCard

**File:** `components/ui/data-table/data-table-mobile-card.tsx`

- Exports generic `DataTableMobileCard<TData>` component
- Uses Radix `Collapsible` for accordion-style expand/collapse
- Props: `row: Row<TData>`, `expandedRowId: string | null`, `onToggle: (rowId: string) => void`
- Collapsed state shows:
  - Primary fields (`meta.mobilePriority === 'primary'`) as card header in `text-base font-medium`
  - Secondary fields (`meta.mobilePriority === 'secondary'`) as muted summary text
  - `ChevronDown` icon that rotates 180° when expanded
- Expanded state (`CollapsibleContent`) shows:
  - Border separator
  - Labeled key-value pairs for all `showOnMobile: true` detail fields
  - Uses `flexRender` to preserve column-level cell formatting (e.g., payment color styling)
  - Labels sourced from `meta.mobileLabel`
- Respects `columnVisibility` via `row.getVisibleCells()` — permission-gated columns are excluded

## Code: DataTableMobileToolbar

**File:** `components/ui/data-table/data-table-mobile-toolbar.tsx`

- Exports generic `DataTableMobileToolbar<TData>` component
- Three stacked sections:
  1. **Search**: Full-width `DataTableSearch` component (reuses existing)
  2. **Controls row**: Sort `Select` dropdown + direction toggle button + filter toggle button with count badge
  3. **Filter section**: Collapsible inline filter panel with stacked column filters
- Sort dropdown shows all sortable columns by name, direction toggle cycles asc/desc
- Filter toggle button shows active filter count as a `Badge` overlay
- Inline filter section uses `Collapsible` for open/close animation
- Filter controls:
  - `MobileTextFilter`: Labeled `Input` for text-type filters
  - `MobileSelectFilter`: Labeled checkbox list with faceted counts for select-type filters
- "Clear all" button resets both column filters and global search
- All controls update TanStack Table state directly (same URL sync as desktop)

## Code: DataTable Updated with Mobile Layout

**File:** `components/ui/data-table/data-table.tsx`

- Desktop table wrapped in `<div className="hidden md:block">`
- Mobile layout in `<div className="md:hidden">` containing:
  - `DataTableMobileToolbar` with shared table instance
  - Empty state handling (noData / noResults) matching desktop behavior
  - Card list mapping `table.getRowModel().rows` to `DataTableMobileCard` components
  - Single-expand state management via `useState<string | null>` — tapping a card collapses the previous one
  - `DataTablePagination` at bottom (same component as desktop)
- Both layouts share the same `useReactTable` instance — sort/filter/search/pagination state is fully synchronized
- No changes to desktop behavior

## Code: Barrel Exports Updated

**File:** `components/ui/data-table/index.ts`

- Added: `export { DataTableMobileCard } from './data-table-mobile-card'`
- Added: `export { DataTableMobileToolbar } from './data-table-mobile-toolbar'`

## Verification

| Proof Artifact                                                       | Status                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Mobile view shows compact cards with name/church/payment and chevron | Implemented via `DataTableMobileCard` with mobilePriority grouping |
| Tapping card expands inline, tapping another collapses current       | Single-expand state in `DataTable` (`expandedRowId`)               |
| Expanded card shows labeled key-value pairs respecting permissions   | Uses `row.getVisibleCells()` + `meta.showOnMobile` + `flexRender`  |
| Mobile toolbar with search, sort dropdown, filter toggle             | `DataTableMobileToolbar` with all three sections                   |
| Filter toggle expands inline filter section                          | Collapsible filter panel with stacked column filters               |
| Mobile controls update TanStack Table state + URL params             | Shared table instance, same URL state hook                         |
| Mobile pagination same as desktop                                    | Same `DataTablePagination` component                               |
| `DataTableMobileCard` exported                                       | New file + barrel export                                           |
| `yarn build` compiles successfully                                   | Verified — no TypeScript errors                                    |
