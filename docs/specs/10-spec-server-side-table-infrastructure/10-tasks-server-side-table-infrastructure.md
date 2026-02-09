# 10-tasks-server-side-table-infrastructure

## Tasks

### [x] 1.0 TanStack Table Core Infrastructure and Shared Components

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

- [x] 1.1 Install `@tanstack/react-table` as a project dependency by running `yarn add @tanstack/react-table`. Verify it appears in `package.json` under `dependencies`.
- [x] 1.2 Create `components/ui/data-table/types.ts`. Define the `DataTableColumnMeta` type with optional fields: `requiredPermission?: Permission`, `filterType?: 'text' | 'select'`, `showOnMobile?: boolean`, `mobileLabel?: string`, `mobilePriority?: 'primary' | 'secondary' | 'detail'`. Add the TanStack Table module augmentation block (`declare module '@tanstack/react-table' { interface ColumnMeta<TData extends RowData, TValue> extends DataTableColumnMeta {} }`) so that `meta` is typed throughout the project. Import `Permission` from `@/lib/security` and `RowData` from `@tanstack/react-table`.
- [x] 1.3 Create `components/ui/data-table/data-table-column-header.tsx`. This is a `'use client'` component. It accepts props: `column: Column<TData, TValue>` (from TanStack Table), `title: string`, and optional `className`. Render a `Button variant="ghost"` with `-ml-3` that, when clicked, calls `column.toggleSorting()` to cycle through asc → desc → clear. Display icons from Lucide: `ArrowUp` when `column.getIsSorted() === 'asc'`, `ArrowDown` when `desc`, `ArrowUpDown` when unsorted. If the column cannot sort (`!column.getCanSort()`), render plain text instead of a button.
- [x] 1.4 Create `components/ui/data-table/data-table-search.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>` (from TanStack Table) and optional `placeholder` string (default: `"Search..."`). Render a full-width `Input` with a `Search` icon absolutely positioned on the left (`pl-10`) and, when `table.getState().globalFilter` is non-empty, an `X` clear button absolutely positioned on the right. On input `onChange`, call `table.setGlobalFilter(value)`. On clear button click, call `table.setGlobalFilter('')`.
- [x] 1.5 Create `components/ui/data-table/data-table-pagination.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>` and optional `pageSizeOptions: number[]` (default: `[10, 25, 50, 100]`). Always render (do not hide when row count is small). Show: (a) "Showing X–Y of Z results" text computed from `table.getState().pagination.pageIndex`, `pageSize`, and `table.getFilteredRowModel().rows.length`; (b) first/prev/next/last page buttons using `Button variant="outline" size="icon"` with `ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight` icons from Lucide — buttons disabled (not hidden) via `!table.getCanPreviousPage()` / `!table.getCanNextPage()`; (c) a `Select` component for page size using `table.setPageSize()`. Use `table.setPageIndex(0)`, `table.previousPage()`, `table.nextPage()`, `table.setPageIndex(table.getPageCount() - 1)` for navigation.
- [x] 1.6 Create `components/ui/data-table/data-table.tsx`. This is a `'use client'` component. Define a generic `DataTable<TData, TValue>` component that accepts props: `columns: ColumnDef<TData, TValue>[]`, `data: TData[]`, `user: User | null`, `initialSort?: SortingState`, `emptyState?: { noData: ReactNode, noResults: ReactNode }`, and `globalFilterFn?: FilterFn<TData>`. Inside, manage controlled state for `sorting` (initialized from `initialSort` or `[]`), `columnFilters` (`ColumnFiltersState`), `globalFilter` (string), `columnVisibility` (`VisibilityState`), and `pagination` (`{ pageIndex: 0, pageSize: 25 }`). Compute `columnVisibility` from the `columns` array and `user` prop: for each column with `meta.requiredPermission`, check `userHasPermission(user, [meta.requiredPermission])` — set the column ID to `false` if the user lacks the permission (import `userHasPermission` from `@/lib/security`). Use `useMemo` to recompute when `columns` or `user` changes. Call `useReactTable()` with: `data`, `columns`, all the state + `onXxxChange` setters, `getCoreRowModel()`, `getSortedRowModel()`, `getFilteredRowModel()`, `getPaginationRowModel()`, `getFacetedRowModel()`, `getFacetedUniqueValues()`. Render the table using shadcn/ui `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`. Use `flexRender` from TanStack Table for rendering header and cell content. Pass the `table` instance to `DataTableSearch`, `DataTablePagination` children. For empty state, show `emptyState.noData` when `data.length === 0`, or `emptyState.noResults` when the table has data but filtered rows are empty. Apply striped row styling (`index % 2 === 1 && 'bg-muted/25'`) consistent with the current candidate list table.
- [x] 1.7 Create `components/ui/data-table/index.ts` as a barrel export file. Re-export `DataTable` from `./data-table`, `DataTableColumnHeader` from `./data-table-column-header`, `DataTablePagination` from `./data-table-pagination`, `DataTableSearch` from `./data-table-search`, and all types from `./types`.
- [x] 1.8 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Fix any type issues that arise from the module augmentation or component generics.

### [x] 2.0 URL State Persistence Hook

**Purpose:** Build the `useDataTableUrlState` hook that syncs TanStack Table state (sorting, column filters, global filter, pagination) to URL query params, enabling bookmarkable and shareable table views.

#### 2.0 Proof Artifact(s)

- Code: `hooks/use-data-table-url-state.ts` exports `useDataTableUrlState` hook
- Demo: Changing sort/search/page in a DataTable updates URL params (e.g., `?sort=name&dir=asc&search=john&page=2&pageSize=25`)
- Demo: Opening a URL with query params restores the exact table state (sort, search, page, pageSize)
- Demo: Search input uses `router.replace()` (no history pollution); sort clicks and page changes use `router.push()` (back/forward works)
- Demo: Changing sort/filter/search resets pagination to page 1
- CLI: `yarn build` compiles successfully

#### 2.0 Relevant Files

- `hooks/use-data-table-url-state.ts` — **New.** `useDataTableUrlState` hook. Reads URL search params on mount to initialize TanStack Table state (sorting, globalFilter, pagination). Writes state changes back to URL params. Uses `router.replace()` for search (no history pollution), `router.push()` for discrete actions (sort, page). Resets pagination to page 1 when sort/filter/search change.
- `components/ui/data-table/data-table.tsx` — **Modified.** Updated to accept optional `urlState` prop from `useDataTableUrlState` to use URL-synced state instead of local state. When `urlState` is provided, the DataTable delegates state management to the hook.
- `components/ui/data-table/index.ts` — **Modified.** Re-export `useDataTableUrlState` from the barrel file.

#### 2.0 Tasks

- [x] 2.1 Create `hooks/use-data-table-url-state.ts`. This is a `'use client'` hook. Import `useSearchParams`, `useRouter`, `usePathname` from `next/navigation` and TanStack Table types (`SortingState`, `ColumnFiltersState`, `PaginationState`). The hook accepts a config object: `{ defaultSort?: SortingState, defaultPageSize?: number, paramPrefix?: string }`. On mount, read URL search params to initialize state: `sort` → sorting column ID, `dir` → sort direction (`asc`/`desc`), `search` → global filter string, `page` → page index (1-based in URL, convert to 0-based for TanStack), `pageSize` → page size. Return an object with: `sorting`, `onSortingChange`, `globalFilter`, `onGlobalFilterChange`, `pagination`, `onPaginationChange` — all compatible with TanStack Table's controlled state API. When sorting changes, serialize to `?sort=columnId&dir=asc` and call `router.push()`. When globalFilter changes, serialize to `?search=value` and call `router.replace()` (debounced URL update to avoid excessive history). When pagination changes, serialize to `?page=N&pageSize=N` and call `router.push()`. When sort or globalFilter changes, reset pagination to page 1. Preserve existing non-table URL params (e.g., `weekend`, `weekendType`) when updating.
- [x] 2.2 Update `components/ui/data-table/data-table.tsx` to support URL state integration. Add an optional `urlState` prop that accepts the return value of `useDataTableUrlState`. When `urlState` is provided, use its state and handlers (`sorting`/`onSortingChange`, `globalFilter`/`onGlobalFilterChange`, `pagination`/`onPaginationChange`) instead of internal `useState`. When `urlState` is not provided, fall back to the existing internal state (backward compatible). This ensures existing usages of `DataTable` without URL state continue to work.
- [x] 2.3 Update `components/ui/data-table/index.ts` to re-export `useDataTableUrlState` from `@/hooks/use-data-table-url-state`.
- [x] 2.4 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Confirm that the existing DataTable usage (if any) still works without the `urlState` prop.

### [x] 3.0 Candidate List Migration to TanStack Table

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

#### 3.0 Relevant Files

- `app/(public)/candidate-list/config/columns.tsx` — **New.** (Replaces `columns.ts`.) Defines TanStack Table `ColumnDef<HydratedCandidate>[]` array. Each column maps the existing `accessor` functions to `accessorFn`, uses `DataTableColumnHeader` for sortable headers, and sets `meta` with `requiredPermission`, `showOnMobile`, `mobileLabel`, `mobilePriority`. Includes the `candidateGlobalFilterFn` that searches across name, email, phone, sponsor, and church fields.
- `app/(public)/candidate-list/components/CandidateListTable.tsx` — **Rewritten.** Replaces the custom implementation with the shared `DataTable` component. Calls `useDataTableUrlState` for URL persistence. Pre-filters candidates (excludes `rejected`/`sponsored`). Passes `columns`, `data`, `user`, `initialSort`, `emptyState`, `globalFilterFn`, and `urlState` to `DataTable`. Desktop uses `DataTable` (`hidden md:block`), mobile renders flat cards (`md:hidden`) using the same TanStack Table row model.
- `app/(public)/candidate-list/hooks/use-candidate-list.ts` — **Deleted.** Replaced by TanStack Table + `useDataTableUrlState`.
- `app/(public)/candidate-list/config/columns.ts` — **Deleted.** Replaced by `columns.tsx`.
- `app/(public)/candidate-list/page.tsx` — **Existing.** No changes needed — still passes `candidates` and `user` to `CandidateListTable`.

#### 3.0 Tasks

- [x] 3.1 Create `app/(public)/candidate-list/config/columns.tsx` (new file, replaces `columns.ts`). Define and export `candidateColumns: ColumnDef<HydratedCandidate>[]` array. Port each column from `CANDIDATE_COLUMNS` in the old `columns.ts`: map `id` → column `id`, `header` → use `DataTableColumnHeader` component, `accessor` → `accessorFn`, `requiredPermission` → `meta.requiredPermission`, `showOnMobile`/`mobileLabel` → `meta.showOnMobile`/`meta.mobileLabel`, add `meta.mobilePriority` (name=`primary`, church/payment=`secondary`, all others=`detail`). For the name column, render the cell with `font-medium`. For the payment column, apply conditional styling (green text for "Paid", red for "Unpaid"). Port the helper functions `calculateAge`, `formatEmergencyContact`, `formatBirthday` from the old `columns.ts`. Also define and export `candidateGlobalFilterFn: FilterFn<HydratedCandidate>` that searches across candidate name (first+last and sponsorship name), email, phone, sponsor name, church, and sponsor church — matching the existing `useCandidateList` search behavior.
- [x] 3.2 Rewrite `app/(public)/candidate-list/components/CandidateListTable.tsx`. This is a `'use client'` component. Import `DataTable` from `@/components/ui/data-table`, `useDataTableUrlState` from `@/hooks/use-data-table-url-state`, and `candidateColumns`/`candidateGlobalFilterFn` from the columns config. Pre-filter candidates to exclude `rejected` and `sponsored` statuses (matching existing behavior). Call `useDataTableUrlState({ defaultSort: [{ id: 'name', desc: false }], defaultPageSize: 25 })`. Render the desktop layout (`hidden md:block`) with `DataTable` passing: `columns={candidateColumns}`, `data={filteredCandidates}`, `user`, `initialSort`, `emptyState`, `globalFilterFn={candidateGlobalFilterFn}`, and `urlState`. For the mobile layout (`md:hidden`), render flat cards using the TanStack Table row model from the DataTable (same data flow, card-based display). Configure empty states: no data → "No candidates for this weekend.", no results → "No candidates found matching your search." with a "Clear filters" button that resets global filter.
- [x] 3.3 Delete the old files: `app/(public)/candidate-list/hooks/use-candidate-list.ts` and `app/(public)/candidate-list/config/columns.ts`. Verify no other files import from these paths.
- [x] 3.4 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Confirm the candidate list page renders correctly.

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
