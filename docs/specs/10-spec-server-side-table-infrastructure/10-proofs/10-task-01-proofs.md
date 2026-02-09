# Task 1.0 Proof Artifacts — TanStack Table Core Infrastructure

## CLI Output

### 1.1 — Dependency Installation

```
$ yarn add @tanstack/react-table
success Saved lockfile.
success Saved 2 new dependencies.
info Direct dependencies
└─ @tanstack/react-table@8.21.3
info All dependencies
├─ @tanstack/react-table@8.21.3
└─ @tanstack/table-core@8.21.3
Done in 4.59s.
```

### 1.8 — Build Verification

```
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 9.9s
✓ Generating static pages using 7 workers (42/42) in 401.3ms
Done in 30.81s.
```

No TypeScript errors. Build passed.

## Code Artifacts

### `components/ui/data-table/types.ts`

- Defines `DataTableColumnMeta` with: `requiredPermission`, `filterType`, `showOnMobile`, `mobileLabel`, `mobilePriority`
- Module augmentation: `declare module '@tanstack/react-table'` extends `ColumnMeta` globally
- Imports `Permission` from `@/lib/security` and `RowData` from `@tanstack/react-table`

### `components/ui/data-table/data-table-column-header.tsx`

- `'use client'` component
- Accepts `column: Column<TData, TValue>`, `title: string`, optional `className`
- Renders `Button variant="ghost"` with sort toggle: asc → desc → clear
- Shows `ArrowUp` / `ArrowDown` / `ArrowUpDown` icons from Lucide
- Falls back to plain text when `!column.getCanSort()`

### `components/ui/data-table/data-table-search.tsx`

- `'use client'` component
- Accepts `table: Table<TData>`, optional `placeholder` (default `"Search..."`)
- Full-width `Input` with `Search` icon (left, `pl-10`) and `X` clear button (right, conditional)
- Calls `table.setGlobalFilter()` on input change, clears on X click

### `components/ui/data-table/data-table-pagination.tsx`

- `'use client'` component
- Accepts `table: Table<TData>`, optional `pageSizeOptions` (default `[10, 25, 50, 100]`)
- Always renders (no hiding)
- Shows "Showing X–Y of Z results" computed from pagination state and filtered row count
- First / prev / next / last buttons using `Button variant="outline" size="icon"` with Lucide icons
- Buttons disabled via `!getCanPreviousPage()` / `!getCanNextPage()`
- Page size `Select` component using `table.setPageSize()`

### `components/ui/data-table/data-table.tsx`

- `'use client'` generic `DataTable<TData, TValue>` component
- Props: `columns`, `data`, `user`, `initialSort`, `emptyState`, `globalFilterFn`
- Controlled state for: `sorting`, `columnFilters`, `globalFilter`, `columnVisibility`, `pagination`
- `columnVisibility` computed via `useMemo` — checks `meta.requiredPermission` against `userHasPermission()`
- Wires up `useReactTable` with: `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`, `getFacetedRowModel`, `getFacetedUniqueValues`
- Renders using shadcn/ui `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- Uses `flexRender` from TanStack Table for header and cell content
- Passes `table` instance to `DataTableSearch` and `DataTablePagination`
- Empty states: `noData` when `data.length === 0`, `noResults` when filtered rows empty
- Striped rows: `index % 2 === 1 && 'bg-muted/25'`

### `components/ui/data-table/index.ts`

- Barrel exports: `DataTable`, `DataTableColumnHeader`, `DataTablePagination`, `DataTableSearch`, `DataTableColumnMeta` (type)

## Verification

- `@tanstack/react-table` appears in `package.json` dependencies ✓
- All 5 new files created in `components/ui/data-table/` ✓
- Module augmentation enables typed `meta` across the project ✓
- `yarn build` compiles successfully with no TypeScript errors ✓
- Column `meta.requiredPermission` drives `columnVisibility` ✓
