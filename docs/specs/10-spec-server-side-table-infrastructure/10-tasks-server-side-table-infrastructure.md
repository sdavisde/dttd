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

### [x] 4.0 Per-Column Filters and Desktop Toolbar

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

#### 4.0 Relevant Files

- `components/ui/data-table/data-table-column-filter.tsx` — **New.** Generic per-column filter component. Renders inside a `Popover` triggered from the column header. Supports two filter modes driven by `meta.filterType`: `"text"` renders an `Input` that calls `column.setFilterValue()` on change; `"select"` renders a checkbox list of unique values with counts (computed via `column.getFacetedUniqueValues()`) where multiple values are selectable (OR logic within column, stored as `string[]` filter value). Includes a search input within the select popover to filter long option lists.
- `components/ui/data-table/data-table-column-header.tsx` — **Modified.** Updated to show a `ListFilter` icon button next to the sort button when `column.columnDef.meta?.filterType` is defined. The filter icon opens the `DataTableColumnFilter` popover. When the column has an active filter, the filter icon shows a colored indicator (primary color dot or highlighted icon).
- `components/ui/data-table/data-table-toolbar.tsx` — **New.** `DataTableToolbar` component. Renders search input (left) and active filter summary (right). Shows a count of active column filters (e.g., "2 filters") with a "Clear all" button that resets both `columnFilters` and `globalFilter`. Hidden when no columns have `meta.filterType` defined.
- `components/ui/data-table/data-table.tsx` — **Modified.** Replace inline `DataTableSearch` with `DataTableToolbar`. Pass `columnFilters` and `onColumnFiltersChange` through URL state when available. Wire up column filter function for select-type filters (array includes filter).
- `hooks/use-data-table-url-state.ts` — **Modified.** Add `columnFilters` and `onColumnFiltersChange` to the URL state. Serialize column filters to URL params as `filter.{columnId}={value}` (comma-separated for multi-select). Parse `filter.*` params on mount to initialize column filter state. Reset pagination when column filters change.
- `app/(public)/candidate-list/config/columns.tsx` — **Modified.** Add `filterType: 'select'` to payment column meta. Add `filterType: 'text'` to name, church, and sponsor columns meta.
- `components/ui/data-table/types.ts` — **Existing.** Already defines `filterType?: 'text' | 'select'` on `DataTableColumnMeta`. No changes needed.
- `components/ui/data-table/index.ts` — **Modified.** Re-export `DataTableToolbar` and `DataTableColumnFilter` from barrel file.

#### 4.0 Tasks

- [x] 4.1 Create `components/ui/data-table/data-table-column-filter.tsx`. This is a `'use client'` component. It accepts `column: Column<TData, TValue>` from TanStack Table. It reads `column.columnDef.meta?.filterType` to decide the filter mode. For `"text"` mode: render an `Input` inside a `Popover` with a placeholder of `"Filter {column title}..."`. On input change, call `column.setFilterValue(value || undefined)`. For `"select"` mode: render a checkbox list inside a `Popover`. Use `column.getFacetedUniqueValues()` to get unique values with counts. Display each value as a `Checkbox` + label + count (e.g., `"Paid (12)"`). Store selected values as a `string[]` via `column.setFilterValue()`. When no checkboxes are selected, call `column.setFilterValue(undefined)` to clear. Include a "Clear" button at the bottom of the popover. Add a text input at the top of the select popover to search/filter long option lists.
- [x] 4.2 Update `components/ui/data-table/data-table-column-header.tsx`. Add a `ListFilter` icon button next to the sort button when `column.columnDef.meta?.filterType` is defined. The filter icon opens the `DataTableColumnFilter` popover. When the column has an active filter (`column.getFilterValue() !== undefined`), show a visual indicator: use `text-primary` class on the filter icon. The filter button should be `variant="ghost"` `size="icon"` with `size-4` icon. Position the filter icon to the right of the sort button.
- [x] 4.3 Define the custom `arrIncludesFilter` function for select-type column filters. Add this to `data-table.tsx` or a separate utility. The filter function receives `row`, `columnId`, and `filterValue` (which is `string[]`). It checks if the row's value for that column is included in the filter array. In `data-table.tsx`, set `filterFn: arrIncludesFilter` on columns that have `meta.filterType === 'select'` by configuring the table's `filterFns` option, or by setting the `filterFn` directly on those columns.
- [x] 4.4 Create `components/ui/data-table/data-table-toolbar.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>`, optional `placeholder` string, and optional `children` (for extra toolbar items). Render: (a) `DataTableSearch` on the left; (b) on the right, show active filter count and a "Clear all" `Button variant="ghost" size="sm"` that calls `table.resetColumnFilters()` and `table.setGlobalFilter('')`. The active filter count is computed from `table.getState().columnFilters.length`. Only show the filter count + clear button when at least 1 column filter or global filter is active. Use `Badge variant="secondary"` for the count.
- [x] 4.5 Update `components/ui/data-table/data-table.tsx`. Replace the standalone `DataTableSearch` with `DataTableToolbar`. Pass `searchPlaceholder` to the toolbar. Wire up `columnFilters` state: when `urlState` provides `columnFilters`/`onColumnFiltersChange`, use those; otherwise use internal state. Pass `onColumnFiltersChange` to `useReactTable`. For columns with `meta.filterType === 'select'`, auto-assign the `arrIncludesFilter` function so individual column definitions don't need to specify it.
- [x] 4.6 Update `hooks/use-data-table-url-state.ts`. Add `columnFilters: ColumnFiltersState` and `onColumnFiltersChange: OnChangeFn<ColumnFiltersState>` to `DataTableUrlState`. On mount, parse URL params matching `filter.{columnId}` pattern — comma-separated values become `string[]` filter value, single text values become `string` filter value. On column filter change, serialize to URL params: for array values use `filter.{columnId}=val1,val2`, for string values use `filter.{columnId}=value`. Delete the param when filter is cleared. Use `router.push()` for column filter changes (adds history entry). Reset pagination when column filters change.
- [x] 4.7 Update `app/(public)/candidate-list/config/columns.tsx`. Add `filterType: 'select'` to the payment column's `meta`. Add `filterType: 'text'` to the name, church, and sponsor columns' `meta`. No other columns need filters.
- [x] 4.8 Update `components/ui/data-table/index.ts`. Re-export `DataTableToolbar` from `./data-table-toolbar` and `DataTableColumnFilter` from `./data-table-column-filter`.
- [x] 4.9 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Confirm no regressions in existing functionality.

### [~] 5.0 Mobile Expandable Cards and Integrated Sort/Filter Controls

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

#### 5.0 Relevant Files

- `components/ui/data-table/data-table-mobile-card.tsx` — **New.** Generic `DataTableMobileCard<TData>` component. Renders a single expandable card using Radix `Collapsible`. Collapsed state shows primary fields (name) in card header, secondary fields (church, payment) as summary badges/text, and a `ChevronDown` expand indicator. Expanded state reveals labeled key-value pairs for all visible columns with `showOnMobile: true`. Uses `meta.mobilePriority` to group fields into header (primary), summary (secondary), and detail sections. Respects `columnVisibility` for permission-gated columns.
- `components/ui/data-table/data-table-mobile-toolbar.tsx` — **New.** Mobile-specific toolbar component. Renders: (a) full-width global search input; (b) a horizontal row with a sort `Select` dropdown (sortable column names + direction toggle) and a `ListFilter` button that toggles an inline filter section; (c) when filter section is expanded, renders all filterable columns as stacked filter controls (text input or checkbox list). Updates TanStack Table state directly via `table.setSorting()`, `table.setColumnFilters()`, and `table.setGlobalFilter()`.
- `components/ui/data-table/data-table.tsx` — **Modified.** Wraps the existing desktop table in `hidden md:block`. Adds a `md:hidden` mobile section that renders `DataTableMobileToolbar`, a list of `DataTableMobileCard` components using `table.getRowModel().rows`, and `DataTablePagination`. Both layouts share the same TanStack Table instance so state is fully synchronized. Passes `emptyState` to mobile layout for no-data and no-results states.
- `components/ui/data-table/index.ts` — **Modified.** Re-export `DataTableMobileCard` and `DataTableMobileToolbar`.

#### 5.0 Tasks

- [x] 5.1 Create `components/ui/data-table/data-table-mobile-card.tsx`. This is a `'use client'` component. It accepts `row: Row<TData>` (from TanStack Table) and `expandedRowId: string | null` and `onToggle: (rowId: string) => void`. Use the Radix `Collapsible` component (`@/components/ui/collapsible`). **Collapsed state**: Render a card (`bg-card border rounded-lg`) with a header section containing: the primary field value (`meta.mobilePriority === 'primary'`) in `text-base font-medium`, secondary fields (`meta.mobilePriority === 'secondary'`) as smaller text/badges to the right, and a `ChevronDown` icon (rotates to `ChevronUp` when expanded). The entire card header is clickable to toggle expand. **Expanded state** (`CollapsibleContent`): Render a divider, then labeled key-value pairs for all visible cells where `meta.showOnMobile === true`, excluding primary/secondary fields already shown in the header. Each pair shows `meta.mobileLabel` as a muted label and the cell's rendered value. Use `flexRender` to render cell content so column-level formatting (e.g., payment color) is preserved. Only show columns that pass visibility checks (use `row.getVisibleCells()` filtered by mobile metadata). Apply the same payment color styling (green/red) for the secondary payment badge in the card header.
- [x] 5.2 Create `components/ui/data-table/data-table-mobile-toolbar.tsx`. This is a `'use client'` component. It accepts `table: Table<TData>` and optional `placeholder: string`. Render three sections stacked vertically: **(a) Search row**: Full-width `DataTableSearch` component. **(b) Controls row**: A `flex items-center gap-2` row with: (1) a `Select` component for sort — options are all sortable columns (`table.getAllColumns().filter(c => c.getCanSort())`), each showing the column header text; include a direction toggle button (`ArrowUpDown`/`ArrowUp`/`ArrowDown`) next to the select that cycles asc→desc→clear; when a sort option is selected, call `table.setSorting([{ id: columnId, desc }])`; (2) a `Button` with `ListFilter` icon and active filter count badge that toggles the filter section visibility; show the count badge only when `table.getState().columnFilters.length > 0`. **(c) Filter section** (conditionally visible): When toggled open, render all filterable columns (columns with `meta.filterType`) as stacked vertical filter controls. For `'text'` filter type, render a labeled `Input`. For `'select'` filter type, render a labeled checkbox group using the same faceted values logic as `SelectFilter` in `data-table-column-filter.tsx`. Include a "Clear all" button that calls `table.resetColumnFilters()` and `table.setGlobalFilter('')`. The filter section should animate open/close using `Collapsible`.
- [x] 5.3 Update `components/ui/data-table/data-table.tsx` to add the mobile layout. Wrap the existing desktop `<Table>` section (the `<div className="rounded-md border">` block containing the table) in `<div className="hidden md:block">`. Add the desktop-only class `hidden md:flex` to the toolbar wrapper. Below the desktop section, add `<div className="md:hidden space-y-3">` containing: (a) `DataTableMobileToolbar` with the same `table` instance and `searchPlaceholder`; (b) empty state handling — when `data.length === 0` show `emptyState?.noData`, when `table.getRowModel().rows.length === 0` show `emptyState?.noResults`; (c) a list mapping `table.getRowModel().rows` to `DataTableMobileCard` components with single-expand state management (one card open at a time, managed via `useState<string | null>`); (d) `DataTablePagination` at the bottom. The desktop toolbar (`DataTableToolbar`) should be wrapped in `hidden md:block` and the `DataTablePagination` at the bottom should remain visible on all screen sizes (shared between layouts) OR be duplicated inside each layout block.
- [x] 5.4 Update `components/ui/data-table/index.ts`. Add re-exports: `export { DataTableMobileCard } from './data-table-mobile-card'` and `export { DataTableMobileToolbar } from './data-table-mobile-toolbar'`.
- [x] 5.5 Run `yarn build` and verify the project compiles successfully with no TypeScript errors. Confirm no regressions in existing desktop functionality.
