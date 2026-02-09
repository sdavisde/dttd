# 10-spec-tanstack-table-infrastructure

## Introduction/Overview

The application currently has 10+ data tables, each with ad-hoc client-side implementations for searching, sorting, filtering, and pagination built from scratch using `useMemo` hooks and custom state management. Every table re-invents the same logic (search filtering, sort toggling, pagination math) with slight variations, none offer per-column filtering UI, and the mobile experience shows flat card lists that are hard to scan.

This spec introduces **TanStack Table** as the shared headless table engine, replacing all ad-hoc table logic with a consistent, well-tested library. It includes a reusable permission model built into column definitions, URL state persistence for shareable/bookmarkable views, and a redesigned mobile experience using compact expandable cards with integrated sort/filter controls. The Candidate List table will be the first migration to prove the pattern.

## Goals

- Integrate TanStack Table (`@tanstack/react-table`) as the headless table engine, using its built-in client-side sorting, filtering, global search, and pagination
- Build a reusable permission model where columns declare their required permission via `meta.requiredPermission`, and the shared `DataTable` component automatically computes column visibility from the current user — with permissions controlling only visibility, not sort/filter/search behavior
- Persist all table state (sort, filters, search, pagination) in URL query params so views are bookmarkable and shareable — and when a user without certain column permissions opens a shared link, they see the same sorted/filtered/paginated data but without the restricted columns
- Build reusable, shared UI components for sortable column headers, per-column filters, global search, pagination, and a toolbar — all working with TanStack Table and shadcn/ui
- Redesign the mobile data display as compact expandable cards with integrated sort/filter controls, replacing the current flat card layout
- Migrate the Candidate List table as the first proof-of-concept, replacing all existing custom hooks (`useCandidateList`, `useTablePagination`) and UI components (`TablePagination`) with the new shared infrastructure

## User Stories

- **As an admin**, I want to sort the candidate list by clicking column headers so that I can quickly organize candidates by name, sponsor, church, or any other attribute.
- **As an admin**, I want to filter candidates by specific column values (e.g., payment status, church) so that I can narrow down the list to exactly the candidates I need to see.
- **As an admin**, I want a global search box that works alongside column filters (AND logic) so that I can search across all columns and then narrow further with specific filters.
- **As an admin**, I want to see how many results match my current filters and easily clear all filters to return to the full list.
- **As an admin**, I want to copy the URL and share it with a colleague so they see the same sorted, filtered view — even if they have different column permissions, they should see the closest possible view minus the columns they can't access.
- **As a mobile user**, I want compact, scannable cards that I can tap to expand for full details, so I can quickly browse large lists without scrolling through walls of text.
- **As a mobile user**, I want sort and filter controls integrated into the mobile view so I can refine the list without switching to a separate panel.
- **As a developer**, I want shared DataTable components with a built-in permission model and URL state sync so that I can add a fully-featured, permission-aware table to any page with minimal boilerplate.

## Demoable Units of Work

### Unit 1: TanStack Table Core, Permission Model, and URL State

**Purpose:** Install TanStack Table, build the foundational `DataTable` component with the permission-aware column visibility model and URL state persistence. This is the infrastructure everything else builds on.

**Functional Requirements:**

- The system shall install `@tanstack/react-table` as a project dependency
- The system shall provide a generic `DataTable<TData, TValue>` component that accepts TanStack Table `ColumnDef[]`, a `data` array, and a `user` prop (of type `User | null`), and renders using shadcn/ui `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` components
- The `DataTable` shall wire up TanStack Table's `getCoreRowModel()`, `getSortedRowModel()`, `getFilteredRowModel()`, and `getPaginationRowModel()` for full client-side data operations
- The `DataTable` shall read `meta.requiredPermission` from each column definition and automatically compute `columnVisibility` state: columns whose `requiredPermission` the user lacks are hidden from rendering, but remain active for sorting, filtering, and global search
- Permission-based column visibility shall be enforced only at the view layer — TanStack Table's `columnVisibility` controls rendering, while sort/filter state operates on the full column set regardless of visibility. Specifically: if a column is hidden due to permissions, sorting by that column still works, column filters on that column still apply, and global search still includes that column's values.
- The system shall provide a `useDataTableUrlState` hook that syncs TanStack Table state (sorting, columnFilters, globalFilter, pagination) to URL search params via `useSearchParams` and `useRouter`
- The URL state hook shall serialize state as readable query params (e.g., `?sort=name&dir=asc&search=john&filter.payment=Paid&page=2&pageSize=25`)
- The URL state hook shall parse URL params on mount to restore table state, so that opening a bookmarked or shared URL reproduces the exact table view
- The URL state hook shall use `router.replace()` for search input changes (to avoid polluting browser history) and `router.push()` for discrete actions (sort clicks, filter selections, page changes) so browser back/forward works naturally
- The `DataTable` shall accept an `initialSort` prop (e.g., `[{ id: 'name', desc: false }]`) for setting the default sort when no URL state is present
- The `DataTable` shall accept an `emptyState` render prop or component for customizing empty state content (different messages for "no data" vs "no results matching filters")
- The system shall provide a `DataTableColumnHeader` component that renders a sortable column header — clicking toggles sort (asc -> desc -> none) with `ArrowUp`/`ArrowDown`/`ArrowUpDown` icons from Lucide, using TanStack Table's `column.toggleSorting()` and `column.getIsSorted()` APIs
- The system shall provide a `DataTablePagination` component that always renders regardless of row count, showing: "Showing X-Y of Z results", first/prev/next/last page buttons, and a page size selector. Navigation buttons shall be disabled (not hidden) when not applicable (e.g., "Previous" disabled on page 1).
- The system shall provide a `DataTableSearch` component (global search input with `Search` icon and `X` clear button) that sets TanStack Table's `globalFilter` state
- Global search and column filters shall work simultaneously with AND logic — global search narrows the full dataset, column filters narrow further within those results

**Proof Artifacts:**

- Code: `components/ui/data-table/data-table.tsx` exports the generic `DataTable` component
- Code: `components/ui/data-table/data-table-column-header.tsx` exports `DataTableColumnHeader`
- Code: `components/ui/data-table/data-table-pagination.tsx` exports `DataTablePagination`
- Code: `components/ui/data-table/data-table-search.tsx` exports `DataTableSearch`
- Code: `hooks/use-data-table-url-state.ts` exports `useDataTableUrlState`
- Build: `yarn build` compiles successfully with new dependency and components

### Unit 2: Candidate List Migration

**Purpose:** Migrate the Candidate List from all existing custom hooks and components to TanStack Table, proving the infrastructure from Unit 1 on the most complex table in the app. This replaces `useCandidateList`, `useTablePagination`, `CandidateColumnConfig`, and the current `CandidateListTable` component entirely.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<HydratedCandidate>[]` column definitions for the Candidate List, with each column specifying: `accessorFn` (ported from current `accessor` functions), `header` (using `DataTableColumnHeader`), `cell` rendering, and `meta` containing `requiredPermission`, `showOnMobile`, `mobileLabel`, and `filterType`
- The system shall replace the current `CandidateListTable` component with a new implementation using the `DataTable` component from Unit 1
- The system shall configure the `DataTable` with `user` prop so permission-based column visibility is automatically computed
- Default sort shall be name ascending (via `initialSort` prop)
- The existing status pre-filter (excluding `rejected` and `sponsored` candidates) shall be applied to the data before passing to `DataTable`
- Global search shall search across candidate name, email, phone, sponsor name, and church fields
- Page size options shall be 10, 25, 50, 100 with a default of 25
- Pagination shall always display regardless of row count
- All table state (sort, search, page, pageSize) shall be synced to URL query params via `useDataTableUrlState`
- The desktop table layout shall use the `DataTable` component (hidden on mobile via `hidden md:block`)
- A mobile layout shall render the same filtered/sorted/paginated rows from TanStack Table's row model (visible only on mobile via `md:hidden`) — the specific mobile card design is delivered in Unit 3, but this unit wires up the data flow
- Empty states shall show contextual messages: "No candidates for this weekend." (no data) or "No candidates found matching your search." with a "Clear filters" action (filters active but no results)
- The system shall remove `useCandidateList` hook, `CandidateColumnConfig` type, and current `CandidateListTable` component after migration
- The existing `useTablePagination` hook and `TablePagination` component shall remain for tables not yet migrated, but are no longer used by the Candidate List

**Proof Artifacts:**

- Demo: `/candidate-list` renders using TanStack Table with sort, search, and pagination working
- Demo: Clicking any column header sorts the data with visual direction indicator
- Demo: Typing in search filters candidates across name, email, phone, sponsor, church
- Demo: URL updates as sort/search/page changes; copy-pasting URL restores exact table state
- Demo: A user without `READ_CANDIDATE_CONTACT_INFO` opening a shared URL with `?sort=email` sees the table sorted by email but without the email column visible
- Demo: Pagination always visible with disabled nav buttons when on first/last page
- Build: `yarn build` compiles successfully

### Unit 3: Per-Column Filters, Mobile Expandable Cards, and Integrated Mobile Controls

**Purpose:** Complete the UX with per-column filter controls on desktop, a redesigned mobile experience using compact expandable cards, and sort/filter controls integrated directly into the mobile view.

**Functional Requirements:**

**Per-Column Filters (Desktop):**

- Column definitions shall support a `filterType` meta property: `"text"` (free-text column filtering), `"select"` (checkbox list of enum values), or undefined (no filter, sort only)
- The `DataTableColumnHeader` shall render a `ListFilter` icon on filterable columns. Clicking it opens a shadcn/ui `Popover` with the appropriate filter control.
- For `"select"` filter type, the popover shall show a checkbox list of unique values with counts, computed dynamically via TanStack Table's `getFacetedUniqueValues()` API. Multiple values can be selected (OR logic within the column). Include a search input within the popover to filter the options list when there are many unique values.
- For `"text"` filter type, the popover shall show an `Input` field that applies per-column filtering via `column.setFilterValue()` as the user types
- Column headers with active filters shall show a visual indicator (filter icon in primary/accent color, or a small colored dot on the icon)
- The system shall provide a `DataTableToolbar` component that composes: search input (left), active filter count with "Clear all" button (right). "Clear all" resets both column filters and global search via `table.resetColumnFilters()` and `table.resetGlobalFilter()`.
- All filter state shall be synced to URL query params (e.g., `?filter.payment=Paid,Unpaid&filter.church=Grace`)

**Mobile Expandable Cards:**

- The system shall provide a `DataTableMobileCard` component that renders each row as a compact card showing: the primary identifier (name) prominently, plus 1-2 key secondary fields (configurable via column `meta`), and a chevron or expand indicator
- Tapping a card expands it inline (accordion-style) to reveal all visible column values for that row in a labeled list format. Only one card expands at a time (tapping another collapses the current one).
- Expanded card content shall show column labels and values using the column's `mobileLabel` (from `meta`) or `header` text, for all columns the user has permission to view
- Cards shall have improved information hierarchy: name in `font-medium`, secondary fields in `text-muted-foreground text-sm`, status/badges using `Badge` components where appropriate

**Mobile Integrated Sort/Filter:**

- The system shall render a compact sort/filter toolbar directly above the mobile card list (not in a separate sheet), containing: the global search input, a sort dropdown (select column + direction), and a filter button that expands an inline filter section
- The filter section, when expanded, shall show all available column filters stacked vertically below the toolbar, with a "Clear all" action
- The sort dropdown shall use a shadcn/ui `Select` or `DropdownMenu` showing sortable column names, with the current sort indicated
- All mobile sort/filter controls shall update TanStack Table state (and URL params) identically to desktop controls
- The mobile pagination component shall render below the card list, showing the same full pagination bar as desktop (always visible, disabled buttons when not applicable)

**Candidate List Updates:**

- The Candidate List shall use `"select"` filter on the payment column (Paid, Unpaid, Partial values)
- The Candidate List shall use `"text"` filter on name, email, church, and sponsor columns
- The Candidate List mobile view shall show name as the primary field, with church and payment status as the compact secondary fields

**Proof Artifacts:**

- Demo: Desktop — clicking the filter icon on a column header opens a popover with the appropriate filter control
- Demo: Desktop — selecting "Paid" in the payment column filter shows only paid candidates; the column header shows a visual active-filter indicator
- Demo: Desktop — "3 filters active" displays in toolbar; "Clear all" resets all filters and search
- Demo: Desktop — faceted filter popover shows value counts (e.g., "Paid (12)", "Unpaid (5)")
- Demo: Desktop — filter state reflected in URL (e.g., `?filter.payment=Paid`)
- Demo: Mobile — cards show compact name + key fields; tapping expands to show all visible column values
- Demo: Mobile — sort dropdown changes sort order; inline filter controls narrow the card list
- Demo: Mobile — filter and sort changes update URL identically to desktop
- Build: `yarn build` compiles successfully

## Non-Goals (Out of Scope)

1. **Server-side sorting/filtering/pagination**: All data operations remain client-side using TanStack Table's built-in row models. Server-side can be added later via TanStack Table's `manualPagination`/`manualSorting`/`manualFiltering` modes if data volume demands it.
2. **Migrating all existing tables**: Only the Candidate List table will be migrated in this spec. Other tables (Payments, Weekend Roster, Candidate Review, Roles, etc.) will be migrated in a follow-up spec using the components built here.
3. **Infinite scroll**: Not implementing scroll-based loading; keeping traditional pagination with page size selector.
4. **Real-time/live data updates**: Tables will not auto-refresh when data changes.
5. **Row selection**: TanStack Table supports row selection (checkboxes), but this is not needed for the Candidate List and is out of scope.
6. **Column reordering or resizing**: Not implementing drag-to-reorder or resize columns.
7. **Server-side permission enforcement on data**: Permissions control column visibility in the UI only. The server action still returns all data fields. Server-side field-level filtering is a separate concern.

## Design Considerations

**Desktop Column Headers:**

- Sort: Clicking the column header text/button toggles sort through `asc -> desc -> none`. Uses `ArrowUp`, `ArrowDown`, and `ArrowUpDown` icons from Lucide. Rendered as a `Button variant="ghost"` per the shadcn/ui DataTable pattern.
- Filter: A small `ListFilter` icon appears on filterable columns. Clicking opens a `Popover` anchored to the header.
- Active filter indicator: The filter icon renders in the primary color or displays a small colored dot when a filter is active on that column.

**Filter Popovers:**

- Text filter: An `Input` field. Filtering applies as the user types.
- Select/enum filter: A scrollable list of `Checkbox` items showing each unique value and its count (from `getFacetedUniqueValues()`). Multiple values can be selected (OR logic). Includes a search input at the top to narrow options when the list is long.
- Uses shadcn/ui `Popover`, `PopoverTrigger`, `PopoverContent`.

**Global Search:**

- Full-width `Input` with `Search` icon (left) and `X` clear button (right).
- Works simultaneously with column filters (AND logic).

**Toolbar Layout:**

- Desktop: `[Search input] .......... [N filters active | Clear all]`
- Mobile: `[Search input] [Sort dropdown] [Filter toggle]`

**Mobile Expandable Cards:**

- Collapsed state: Compact card with primary name (bold, `text-base`), 1-2 secondary fields (`text-sm text-muted-foreground`), and a `ChevronDown` indicator
- Expanded state: Full detail view with all visible column values in a labeled key-value list. The chevron rotates to `ChevronUp`. Smooth expand/collapse animation using CSS transitions or Radix Collapsible.
- Card styling: `bg-card border rounded-lg` with appropriate padding. Collapsed cards should be dense enough to show 5-7+ items in a mobile viewport.

**Mobile Integrated Sort/Filter:**

- Sort: A compact `Select` dropdown in the toolbar showing "Sort: Name (A-Z)" or similar, with all sortable columns as options and asc/desc variants
- Filter: A toggle button (e.g., `SlidersHorizontal` icon with badge showing active filter count) that expands/collapses an inline filter section below the toolbar. This keeps filters always accessible without navigating away.
- The expanded filter section shows each filterable column as a labeled row with its filter control (text input or multi-select chips).

**Pagination:**

- Full bar always visible on both desktop and mobile: "Showing X-Y of Z", first/prev/next/last buttons, page size selector
- Buttons are disabled (not hidden) when not applicable
- Consistent design across desktop and mobile

**Empty States:**

- No data: Contextual message (e.g., "No candidates for this weekend.")
- No results from filter/search: "No results found." with a "Clear filters" action that resets all filters and search

## Repository Standards

- All UI components must use shadcn/ui (Radix UI primitives) — no Material-UI or other UI libraries
- New shared DataTable components go in `components/ui/data-table/` as a cohesive module
- Client components are marked with `'use client'`
- Dual layout strategy for responsive design: `hidden md:block` for desktop table, `md:hidden` for mobile cards
- Follow TanStack Table's `ColumnDef<TData>` pattern for column definitions, using `accessorFn` or `accessorKey` for data access and `meta` for custom properties (`requiredPermission`, `filterType`, `showOnMobile`, `mobileLabel`)
- Column definition files are co-located with their feature (e.g., `app/(public)/candidate-list/config/columns.tsx`)
- Existing custom table hooks and components (`useCandidateList`, `useTablePagination`, `CandidateColumnConfig`, `TablePagination`) can be freely replaced or removed as tables are migrated — no backwards compatibility required for the Candidate List migration

## Technical Considerations

**TanStack Table Configuration:**

- Use `useReactTable` hook with row models: `getCoreRowModel()`, `getSortedRowModel()`, `getFilteredRowModel()`, `getPaginationRowModel()`, and `getFacetedRowModel()`, `getFacetedUniqueValues()` for faceted filters
- Controlled state: `sorting` (`SortingState`), `columnFilters` (`ColumnFiltersState`), `globalFilter` (string), `columnVisibility` (`VisibilityState`), `pagination` (`{ pageIndex, pageSize }`)
- Use `onSortingChange`, `onColumnFiltersChange`, `onGlobalFilterChange`, `onPaginationChange` callbacks to sync state changes to URL params
- Use `flexRender` from TanStack Table for rendering headers and cells

**Permission Model Implementation:**

- Each `ColumnDef` can declare `meta: { requiredPermission: Permission.SOME_PERMISSION }`
- The `DataTable` component accepts a `user` prop and on mount (and when user changes) computes: `columnVisibility = Object.fromEntries(columns.filter(c => c.meta?.requiredPermission).map(c => [c.id, userHasPermission(user, [c.meta.requiredPermission])]))`
- This `columnVisibility` is merged with any URL-provided visibility state, with permissions taking precedence (a user can never make a restricted column visible via URL)
- Critically, `columnVisibility` only affects rendering. TanStack Table's sort, filter, and global search models operate on all columns regardless of visibility. This is the default TanStack Table behavior — sorting and filtering are independent of column visibility.

**URL State Serialization:**

- Sort: `?sort=name&dir=asc` (single-column sort for simplicity)
- Search: `?search=john`
- Column filters: `?filter.payment=Paid,Unpaid&filter.church=Grace` (dot notation for column ID, comma-separated for multi-select)
- Pagination: `?page=2&pageSize=25`
- The `useDataTableUrlState` hook handles bidirectional sync: reading URL on mount to initialize state, and writing URL when state changes
- Use `router.replace()` for search typing (avoid history pollution), `router.push()` for discrete actions (sort click, filter select, page change)
- When sort/filter/search change, pagination resets to page 1

**Column Meta Type:**

- Define a `DataTableColumnMeta` type that extends TanStack Table's default `ColumnMeta`:
  ```
  type DataTableColumnMeta = {
    requiredPermission?: Permission
    filterType?: 'text' | 'select'
    showOnMobile?: boolean
    mobileLabel?: string
    mobilePriority?: 'primary' | 'secondary' | 'detail'  // controls what shows in collapsed vs expanded card
  }
  ```
- Register this type globally via TanStack Table's module augmentation so `meta` is typed throughout

**Global Filter Function:**

- TanStack Table's default global filter searches all columns. Since we use `accessorFn` (not `accessorKey`), we may need a custom `globalFilterFn` that iterates visible column values for each row and checks `includesString`.
- Global search and column filters use AND logic: both are applied simultaneously by TanStack Table's filter pipeline (global filter runs first, then column filters).

**Mobile Expandable Cards:**

- Use Radix UI `Collapsible` (already available via shadcn/ui) or simple state + CSS transitions for expand/collapse
- Manage expanded state: only one card expanded at a time (tracked by row ID in React state)
- Read column `meta.mobilePriority` to determine which fields appear in collapsed vs expanded views:
  - `primary`: Always visible in collapsed card (e.g., name)
  - `secondary`: Visible in collapsed card as supplementary info (e.g., church, payment status)
  - `detail`: Only visible when card is expanded (e.g., email, phone, sponsor)
  - Columns without `mobilePriority` default to `detail`

**Existing Code Impact:**

- `useCandidateList` hook → deleted (replaced by TanStack Table)
- `CandidateColumnConfig` type and related functions → deleted (replaced by `ColumnDef` with `meta`)
- `CandidateListTable` component → rewritten from scratch using `DataTable`
- `useTablePagination` hook → remains for non-migrated tables, can be deleted when all tables migrate
- `TablePagination` component → remains for non-migrated tables, can be deleted when all tables migrate
- `getCandidateListPageData` action → unchanged (still fetches all data, passed to client component)

## Security Considerations

- Permission-based column visibility is enforced at the UI layer by the `DataTable` component. The `columnVisibility` state derived from user permissions cannot be overridden via URL params — the permission check always takes precedence.
- Even though hidden columns participate in sort/filter, the column data values are never rendered in the DOM for hidden columns, so sensitive data is not exposed in the page markup.
- The data fetching layer (`getCandidateListPageData`) is unchanged and continues to apply its own authorization checks before returning data.
- No new security concerns introduced since all data operations remain client-side and data fetching is unchanged.

## Success Metrics

1. **Feature completeness**: Candidate List table fully functional with TanStack Table — sorting, global search, per-column filtering, pagination, URL state, permission-based column visibility, and mobile expandable cards all working
2. **Permission model works**: A user without certain permissions opening a shared URL sees the correct sorted/filtered/paginated view minus restricted columns — no errors, no broken state
3. **URL shareability**: Any table view can be shared via URL; recipient sees the same view (adjusted for their permissions)
4. **Reusability**: The `DataTable` component and supporting pieces are generic — ready to use for any table with only column definitions and data as inputs
5. **Developer experience**: Migrating a table requires defining `ColumnDef[]` with `meta` and using `DataTable` — no custom hooks or state management needed
6. **Mobile UX improvement**: Compact expandable cards are meaningfully easier to scan than the current flat card layout; sort/filter controls are accessible without leaving the view
7. **Build health**: `yarn build` compiles successfully with no new TypeScript errors

## Open Questions

1. For the global search, should we use TanStack Table's built-in `includesString` filter, or implement a custom fuzzy matching function (e.g., using `match-sorter`)? Built-in is simpler; fuzzy is more forgiving of typos.
2. For the mobile expanded card, should the expand/collapse animate (smooth height transition) or snap instantly? Animation is more polished but adds complexity.
3. Should the `mobilePriority` system use the three tiers proposed (`primary`/`secondary`/`detail`), or is a simpler `showOnMobileCollapsed: boolean` sufficient?
