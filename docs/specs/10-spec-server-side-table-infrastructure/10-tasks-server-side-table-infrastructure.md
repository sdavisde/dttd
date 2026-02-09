# 10-tasks-server-side-table-infrastructure

## Tasks

### [~] 1.0 TanStack Table Core Infrastructure and Shared Components

**Purpose:** Install TanStack Table, build the foundational `DataTable<TData, TValue>` component with the permission-aware column visibility model, and create all shared sub-components (sortable column headers, pagination, global search). This is the infrastructure everything else builds on.

#### 1.0 Proof Artifact(s)

- CLI: `yarn build` compiles successfully with `@tanstack/react-table` installed and all new components
- Code: `components/ui/data-table/data-table.tsx` exports a generic `DataTable` component that accepts `ColumnDef[]`, `data`, and `user` props, wires up `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`
- Code: `components/ui/data-table/data-table-column-header.tsx` exports `DataTableColumnHeader` with sort toggle (asc → desc → none) and Lucide arrow icons
- Code: `components/ui/data-table/data-table-pagination.tsx` exports `DataTablePagination` with "Showing X-Y of Z", first/prev/next/last buttons (disabled when not applicable), and page size selector
- Code: `components/ui/data-table/data-table-search.tsx` exports `DataTableSearch` with Search icon and X clear button
- Code: Column `meta.requiredPermission` drives `columnVisibility` — hidden columns are excluded from rendering but remain active for sort/filter/search

#### 1.0 Relevant Files

- `components/ui/data-table/data-table.tsx` — **New.** Generic `DataTable<TData, TValue>` component. Accepts `ColumnDef[]`, `data`, `user`, `initialSort`, `emptyState` props. Wires up `useReactTable` with core/sorted/filtered/pagination row models. Computes `columnVisibility` from `meta.requiredPermission` and user permissions. Renders using shadcn/ui `Table` sub-components via `flexRender`.
- `components/ui/data-table/data-table-column-header.tsx` — **New.** `DataTableColumnHeader` component. Renders a `Button variant="ghost"` that toggles sort (asc → desc → none) via `column.toggleSorting()`. Shows `ArrowUp`/`ArrowDown`/`ArrowUpDown` icons from Lucide based on `column.getIsSorted()`.
- `components/ui/data-table/data-table-pagination.tsx` — **New.** `DataTablePagination` component. Always renders. Shows "Showing X–Y of Z results", first/prev/next/last page buttons (disabled when not applicable), and a page size selector (`Select` component). Uses `table.getState().pagination`, `table.getFilteredRowModel().rows.length`, `table.setPageIndex()`, `table.setPageSize()`.
- `components/ui/data-table/data-table-search.tsx` — **New.** `DataTableSearch` component. Full-width `Input` with `Search` icon (left) and `X` clear button (right). Sets `table.setGlobalFilter()` on input change.
- `components/ui/data-table/types.ts` — **New.** Defines `DataTableColumnMeta` type (`requiredPermission`, `filterType`, `showOnMobile`, `mobileLabel`, `mobilePriority`). Contains the TanStack Table module augmentation (`declare module '@tanstack/react-table'`) so `meta` is typed globally.
- `components/ui/data-table/index.ts` — **New.** Barrel export file re-exporting all data-table components and types for clean imports.
- `components/ui/table.tsx` — **Existing.** shadcn/ui table primitives (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`). Read-only reference — `DataTable` renders using these components.
- `components/ui/button.tsx` — **Existing.** Used by `DataTableColumnHeader` (`variant="ghost"`). Read-only reference.
- `components/ui/input.tsx` — **Existing.** Used by `DataTableSearch`. Read-only reference.
- `components/ui/select.tsx` — **Existing.** Used by `DataTablePagination` for page size selector. Read-only reference.
- `lib/security.ts` — **Existing.** `Permission` enum and `userHasPermission()` function. Read-only reference — used by `DataTable` to compute `columnVisibility`.
- `lib/users/types.ts` — **Existing.** `User` type. Read-only reference — `DataTable` accepts `user: User | null`.
- `package.json` — **Modified.** Add `@tanstack/react-table` dependency.

#### 1.0 Tasks

- [~] 1.1 Install `@tanstack/react-table` as a project dependency by running `yarn add @tanstack/react-table`. Verify it appears in `package.json` under `dependencies`.
- [ ] 1.2 Create `components/ui/data-table/types.ts`. Define the `DataTableColumnMeta` type with optional fields: `requiredPermission?: Permission`, `filterType?: 'text' | 'select'`, `showOnMobile?: boolean`, `mobileLabel?: string`, `mobilePriority?: 'primary' | 'secondary' | 'detail'`. Add the TanStack Table module augmentation block (`declare module '@tanstack/react-table' { interface ColumnMeta<TData extends RowData, TValue> extends DataTableColumnMeta {} }`) so that `meta` is typed throughout the project. Import `Permission` from `@/lib/security` and `RowData` from `@tanstack/react-table`.
- [ ] 1.3 Create `components/ui/data-table/data-table-column-header.tsx`. This is a `'use client'` component. It accepts props: `column: Column<TData, TValue>` (from TanStack Table), `title: string`, and optional `className`. Render a `Button variant="ghost"` with `-ml-3` that, when clicked, calls `column.toggleSorting()` to cycle through asc → desc → clear. Display icons from Lucide: `ArrowUp` when `column.getIsSorted() === 'asc'`, `ArrowDown` when `desc`, `ArrowUpDown` when unsorted. If the column cannot sort (`!column.getCanSort()`), render plain text instead of a button.
- [ ] 1.4 Create `components/ui/data-table/data-table-search.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>` (from TanStack Table) and optional `placeholder` string (default: `"Search..."`). Render a full-width `Input` with a `Search` icon absolutely positioned on the left (`pl-10`) and, when `table.getState().globalFilter` is non-empty, an `X` clear button absolutely positioned on the right. On input `onChange`, call `table.setGlobalFilter(value)`. On clear button click, call `table.setGlobalFilter('')`.
- [ ] 1.5 Create `components/ui/data-table/data-table-pagination.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>` and optional `pageSizeOptions: number[]` (default: `[10, 25, 50, 100]`). Always render (do not hide when row count is small). Show: (a) "Showing X–Y of Z results" text computed from `table.getState().pagination.pageIndex`, `pageSize`, and `table.getFilteredRowModel().rows.length`; (b) first/prev/next/last page buttons using `Button variant="outline" size="icon"` with `ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight` icons from Lucide — buttons disabled (not hidden) via `!table.getCanPreviousPage()` / `!table.getCanNextPage()`; (c) a `Select` component for page size using `table.setPageSize()`. Use `table.setPageIndex(0)`, `table.previousPage()`, `table.nextPage()`, `table.setPageIndex(table.getPageCount() - 1)` for navigation.
- [ ] 1.6 Create `components/ui/data-table/data-table.tsx`. This is a `'use client'` component. Define a generic `DataTable<TData, TValue>` component that accepts props: `columns: ColumnDef<TData, TValue>[]`, `data: TData[]`, `user: User | null`, `initialSort?: SortingState`, `emptyState?: { noData: ReactNode, noResults: ReactNode }`, and `globalFilterFn?: FilterFn<TData>`. Inside, manage controlled state for `sorting` (initialized from `initialSort` or `[]`), `columnFilters` (`ColumnFiltersState`), `globalFilter` (string), `columnVisibility` (`VisibilityState`), and `pagination` (`{ pageIndex: 0, pageSize: 25 }`). Compute `columnVisibility` from the `columns` array and `user` prop: for each column with `meta.requiredPermission`, check `userHasPermission(user, [meta.requiredPermission])` — set the column ID to `false` if the user lacks the permission (import `userHasPermission` from `@/lib/security`). Use `useMemo` to recompute when `columns` or `user` changes. Call `useReactTable()` with: `data`, `columns`, all the state + `onXxxChange` setters, `getCoreRowModel()`, `getSortedRowModel()`, `getFilteredRowModel()`, `getPaginationRowModel()`, `getFacetedRowModel()`, `getFacetedUniqueValues()`. Render the table using shadcn/ui `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`. Use `flexRender` from TanStack Table for rendering header and cell content. Pass the `table` instance to `DataTableSearch`, `DataTablePagination` children. For empty state, show `emptyState.noData` when `data.length === 0`, or `emptyState.noResults` when the table has data but filtered rows are empty. Apply striped row styling (`index % 2 === 1 && 'bg-muted/25'`) consistent with the current candidate list table.
- [ ] 1.7 Create `components/ui/data-table/index.ts` as a barrel export file. Re-export `DataTable` from `./data-table`, `DataTableColumnHeader` from `./data-table-column-header`, `DataTablePagination` from `./data-table-pagination`, `DataTableSearch` from `./data-table-search`, and all types from `./types`.
- [ ] 1.8 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Fix any type issues that arise from the module augmentation or component generics.

### [ ] 2.0 URL State Persistence Hook

**Purpose:** Build the `useDataTableUrlState` hook that syncs TanStack Table state (sorting, column filters, global filter, pagination) to URL query params, enabling bookmarkable and shareable table views.

#### 2.0 Proof Artifact(s)

- Code: `hooks/use-data-table-url-state.ts` exports `useDataTableUrlState` hook
- Demo: Changing sort/search/page in a DataTable updates URL params (e.g., `?sort=name&dir=asc&search=john&page=2&pageSize=25`)
- Demo: Opening a URL with query params restores the exact table state (sort, search, page, pageSize)
- Demo: Search input uses `router.replace()` (no history pollution); sort clicks and page changes use `router.push()` (back/forward works)
- Demo: Changing sort/filter/search resets pagination to page 1
- CLI: `yarn build` compiles successfully

#### 2.0 Tasks

TBD

### [ ] 3.0 Candidate List Migration to TanStack Table

**Purpose:** Migrate the Candidate List from all existing custom hooks and components to TanStack Table, proving the infrastructure from Tasks 1.0 and 2.0 on the most complex table in the app. Replace `useCandidateList`, `CandidateColumnConfig`, and the current `CandidateListTable` with TanStack Table column definitions and the shared `DataTable`.

#### 3.0 Proof Artifact(s)

- Demo: `/candidate-list` renders using TanStack Table with sort, global search, and pagination all working
- Demo: Clicking any column header sorts the data with visual direction indicator (asc/desc/none)
- Demo: Typing in search filters candidates across name, email, phone, sponsor, church
- Demo: URL updates as sort/search/page changes; copy-pasting URL restores exact table state
- Demo: A user without `READ_CANDIDATE_CONTACT_INFO` sees the table sorted/filtered correctly but without the email/phone columns visible
- Demo: Pagination always visible with disabled nav buttons on first/last page; page size options 10, 25, 50, 100
- Demo: Empty states show "No candidates for this weekend." (no data) or "No candidates found matching your search." with Clear filters action
- Code: `useCandidateList` hook, `CandidateColumnConfig` type, and old `CandidateListTable` component are removed
- CLI: `yarn build` compiles successfully

#### 3.0 Tasks

TBD

### [ ] 4.0 Per-Column Filters and Desktop Toolbar

**Purpose:** Add per-column filter controls (text and select/faceted) to the DataTable column headers, build the toolbar component showing active filter count with "Clear all", and sync all filter state to URL params.

#### 4.0 Proof Artifact(s)

- Demo: Clicking the filter icon on a filterable column header opens a popover with the appropriate filter control (text input or checkbox list)
- Demo: Select filter popover shows unique values with counts (e.g., "Paid (12)", "Unpaid (5)") computed via `getFacetedUniqueValues()`; multiple values selectable (OR within column)
- Demo: Text filter applies as user types via `column.setFilterValue()`
- Demo: Column headers with active filters show a visual indicator (colored filter icon or dot)
- Demo: `DataTableToolbar` shows search input (left), active filter count + "Clear all" button (right); "Clear all" resets both column filters and global search
- Demo: Candidate List uses `"select"` filter on payment column, `"text"` filter on name/email/church/sponsor columns
- Demo: Filter state reflected in URL (e.g., `?filter.payment=Paid,Unpaid&filter.church=Grace`)
- Code: `components/ui/data-table/data-table-toolbar.tsx` exports `DataTableToolbar`
- Code: `components/ui/data-table/data-table-column-header.tsx` updated with filter popover
- CLI: `yarn build` compiles successfully

#### 4.0 Tasks

TBD

### [ ] 5.0 Mobile Expandable Cards and Integrated Sort/Filter Controls

**Purpose:** Redesign the mobile experience with compact expandable cards (accordion-style) and integrated sort/filter controls directly in the mobile view, replacing the current flat card layout.

#### 5.0 Proof Artifact(s)

- Demo: Mobile view shows compact cards with name as primary field, church and payment status as secondary fields, and a chevron expand indicator
- Demo: Tapping a card expands it inline (accordion-style) to reveal all visible column values; tapping another collapses the current one
- Demo: Expanded card shows labeled key-value pairs for all columns the user has permission to view
- Demo: Mobile toolbar renders above cards with: global search input, sort dropdown (column + direction), and filter toggle button
- Demo: Filter toggle expands an inline filter section below toolbar with all available column filters stacked vertically
- Demo: Mobile sort/filter controls update TanStack Table state (and URL params) identically to desktop
- Demo: Mobile pagination renders below cards with the same full pagination bar as desktop
- Code: `components/ui/data-table/data-table-mobile-card.tsx` exports `DataTableMobileCard`
- CLI: `yarn build` compiles successfully

#### 5.0 Tasks

TBD
