# 11-spec-table-migration

## Introduction/Overview

The application has 6 remaining data tables that use ad-hoc implementations for searching, sorting, filtering, and pagination — each reinventing the same logic with `useMemo`, `useState`, and the legacy `useTablePagination` hook. Spec 10 established TanStack Table as the shared headless table engine and proved the pattern with the Candidate List table migration, building reusable `DataTable`, `DataTableToolbar`, `DataTablePagination`, `DataTableMobileCard`, and `useDataTableUrlState` infrastructure.

This spec migrates all 6 remaining complex tables to the shared DataTable infrastructure, adds two small enhancements to the DataTable component (`onRowClick` prop for row-level navigation and a `columnVisibility` override prop for dynamic columns), and delivers mobile card layouts for the 2 tables that currently lack them. After migration, all replaced custom hooks and components are deleted.

## Goals

- Migrate 6 tables (Candidate Review, Weekend Roster, Dropped Roster, Payments, Master Roster, Roles) to the shared `DataTable` component with `useDataTableUrlState` for URL-persistent, bookmarkable/shareable table views
- Add `onRowClick` prop to `DataTable` for row-level navigation with loading state (used by Candidate Review, Master Roster, Roles)
- Add `columnVisibility` prop to `DataTable` for explicit column visibility overrides beyond the permission model (used by Weekend Roster, Master Roster)
- Migrate all 4 existing mobile card layouts to `DataTableMobileCard` and add new mobile card layouts for Master Roster and Roles
- Delete all replaced custom hooks (`useCandidateReviewTable`, per-table `useTablePagination` calls) and ad-hoc table components after migration

## User Stories

- **As an admin**, I want all data tables in the application to behave consistently — same sort/filter/search/pagination patterns, same URL persistence, same mobile experience — so I don't have to relearn different interfaces on different pages.
- **As an admin**, I want to bookmark or share a filtered/sorted view of any table (payments, roster, candidate review, etc.) so my colleagues see the exact same view when they open the link.
- **As a mobile user**, I want every data table to show compact, scannable cards with sort/filter controls so I can work effectively on my phone without switching to a desktop.
- **As a developer**, I want every table in the app to use the same `DataTable` component and `useDataTableUrlState` hook so there's one pattern to learn, one place to fix bugs, and no ad-hoc table logic scattered across features.

## Demoable Units of Work

### Unit 1: DataTable Enhancements + Candidate Review Table Migration

**Purpose:** Enhance the shared DataTable component with `onRowClick` and `columnVisibility` props, then migrate the most complex table (Candidate Review) to prove these enhancements work. This unit must be completed and verified before the remaining units begin.

**Functional Requirements:**

**DataTable Infrastructure Enhancements:**

- The `DataTable` component shall accept an optional `onRowClick` prop of type `(row: TData) => void`. When provided, each `TableRow` in the desktop layout shall render with `cursor-pointer` styling and call `onRowClick(row.original)` on click. Cells that contain interactive elements (dropdowns, popovers, buttons) shall use `e.stopPropagation()` in their `cell` renderers to prevent triggering the row click.
- The `DataTable` component shall accept an optional `columnVisibility` prop of type `VisibilityState`. When provided, this visibility map shall be merged with the permission-derived visibility, where both must be `true` for a column to be visible (i.e., if either permissions OR the explicit prop hides a column, it stays hidden). This allows parent components to dynamically show/hide columns based on props like `isEditable` or `includePaymentInformation` without modifying the permission model.
- The `DataTableMobileCard` component shall accept an optional `onCardClick` prop of type `(row: TData) => void`. When provided, the collapsed card area shall be clickable with `cursor-pointer` styling.

**Candidate Review Table Migration:**

- The system shall define TanStack Table `ColumnDef<HydratedCandidate>[]` column definitions for the Candidate Review table with columns: Name, Email, Sponsor, Submitted (date), Status (with `StatusChip` cell renderer), Payment (with `CandidatePaymentInfo` cell renderer and `stopPropagation`), and Actions (dropdown menu with View Details, Send Forms, Request Payment, Reject actions and `stopPropagation`)
- The Status column shall use `filterType: 'select'` so users can filter by candidate status values using the DataTable's built-in faceted filter popover. The status column's `accessorFn` shall return the human-readable status label (e.g., "Sponsored", "Awaiting Forms") for display in the filter list.
- The Status column shall use a custom `sortingFn` that sorts by the action-priority order: Sponsored, Pending Approval, Awaiting Forms, Awaiting Payment, Confirmed, Rejected (matching the current `STATUS_ORDER` behavior)
- The Status column header shall include the existing `StatusLegend` popover (Info icon) rendered within the `header` function alongside `DataTableColumnHeader`
- The `onRowClick` prop shall navigate to `/review-candidates/${candidate.id}` using `router.push()`
- The Candidate Review page shall use `useDataTableUrlState` for URL-persistent sort, search, filter, and pagination state
- The existing "Show Archived" toggle shall be preserved. When unchecked (default), rejected candidates are pre-filtered out of the data before passing to `DataTable`. When checked, rejected candidates are included in the data. This toggle's state shall be synced to URL params (e.g., `?archived=true`)
- Confirmation modals (Send Forms, Send Payment Request, Reject) and their server action handlers shall remain in the parent `CandidateReviewTable` component, with callbacks passed to the actions column's `cell` renderer
- The mobile layout shall use `DataTableMobileCard` with `DataTableMobileToolbar`, showing name (primary), status chip (secondary), and email/sponsor/submitted/payment in expanded detail view
- Default sort shall be status ascending (action-priority order), matching current behavior
- Page size options shall be 10, 25, 50, 100 with a default of 25
- Empty states shall show contextual messages: "No candidates found." (no data) or "No candidates found matching your search." with a "Clear filters" action

**Cleanup:**

- The system shall delete `hooks/use-candidate-review-table.ts`
- The system shall delete `app/(public)/review-candidates/components/CandidateTableControls.tsx`
- The system shall delete `app/(public)/review-candidates/components/CandidateTable.tsx` (the review-specific table component, NOT the review page itself)

**Proof Artifacts:**

- Code: `components/ui/data-table/data-table.tsx` updated with `onRowClick` and `columnVisibility` props
- Demo: `/review-candidates` renders using DataTable with sort, search, status filter, pagination, and row-click navigation all working
- Demo: Status column filter popover shows faceted status values (Sponsored, Awaiting Forms, etc.) with counts
- Demo: Clicking a row navigates to the candidate detail page; clicking the actions dropdown does NOT navigate
- Demo: "Show Archived" toggle includes/excludes rejected candidates; toggle state persists in URL
- Demo: URL updates as sort/search/filter/page changes; copy-pasting URL restores exact table state
- Demo: Mobile cards show name + status, expand to show all fields, sort/filter toolbar works
- Build: `yarn build` compiles successfully

### Unit 2: Weekend Roster Table Migration

**Purpose:** Migrate the Weekend Roster table, which has the most complex cell renderers (edit modal, medical modal, payment info, forms checkbox) and dynamic columns based on props.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<WeekendRosterMember>[]` column definitions for the Weekend Roster with columns: Name, Phone, Role (with rollo suffix), Forms (disabled checkbox), Emergency Contact, Medical (stethoscope button opening `MedicalInfoModal`), Payment (`PaymentInfo` component), and Actions (edit button opening `EditTeamMemberModal`)
- The Role column shall use a custom `sortingFn` that sorts by `CHARole` enum position, then by name alphabetically (matching current `getRoleSortOrder` behavior). Default sort shall be role ascending.
- The Payment and Actions columns shall be defined in the column array with IDs `payment` and `actions`. The parent component shall compute a `columnVisibility` map: `{ payment: includePaymentInformation, actions: isEditable }` and pass it to `DataTable` via the new `columnVisibility` prop.
- Data passed to `DataTable` shall pre-filter out dropped members (`status !== 'drop'`)
- The Weekend Roster shall use `useDataTableUrlState` for URL state persistence
- A custom `globalFilterFn` shall search across name, email, phone, role, status, and rollo fields
- The mobile layout shall use `DataTableMobileCard` with name (primary), role/rollo badge (secondary), and phone/email/emergency contact/forms/medical/payment in expanded view. Edit and medical buttons shall be accessible in the mobile card.
- Modals (`EditTeamMemberModal`, `MedicalInfoModal`) shall remain in the parent component with state managed via `useState`, triggered by cell renderer callbacks
- Page size options shall be 5, 10, 20, 50 with a default of 10
- Empty states: "No team members assigned to this weekend." (no data) or "No team members found matching your search." (filtered empty)

**Cleanup:**

- The existing ad-hoc `WeekendRosterTable` implementation shall be fully replaced (same file, rewritten)

**Proof Artifacts:**

- Demo: Weekend Roster renders using DataTable with role-based sort, search, pagination
- Demo: Payment and Actions columns show/hide based on `includePaymentInformation` and `isEditable` props
- Demo: Edit button opens modal; medical button opens modal; payment popover works — none trigger row-level side effects
- Demo: URL state persists sort/search/page; back button works
- Demo: Mobile cards show name + role, expand to show all fields with working edit/medical buttons
- Build: `yarn build` compiles successfully

### Unit 3: Dropped Roster Table Migration

**Purpose:** Migrate the Dropped Roster table, which shares the same data model as Weekend Roster but only shows dropped members with a simpler column set.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<WeekendRosterMember>[]` column definitions for the Dropped Roster with columns: Name, Email, Phone, Role, Rollo, Status (badge showing "Dropped")
- The Role column shall use the same `CHARole` enum sort as Weekend Roster. Default sort shall be role ascending.
- Data passed to `DataTable` shall pre-filter to only include dropped members (`status === 'drop'`)
- The Dropped Roster shall use `useDataTableUrlState` for URL state persistence
- A custom `globalFilterFn` shall search across name, email, phone, role, and rollo fields
- The mobile layout shall use `DataTableMobileCard` with name (primary), role badge + "Dropped" badge (secondary), and email/phone/rollo in expanded view
- Page size options shall be 5, 10, 20, 50 with a default of 10
- Empty states: "No dropped team members." (no data) or "No dropped members found matching your search." (filtered empty)

**Cleanup:**

- The existing ad-hoc `DroppedRosterTable` implementation shall be fully replaced (same file, rewritten)

**Proof Artifacts:**

- Demo: Dropped Roster renders using DataTable with role-based sort, search, pagination
- Demo: Only dropped members are shown
- Demo: URL state persists; mobile cards work with DataTableMobileCard
- Build: `yarn build` compiles successfully

### Unit 4: Payments Table Migration

**Purpose:** Migrate the Payments table, which has custom formatters (currency, date), badge variants, and a metadata popover.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<PaymentTransactionDTO>[]` column definitions for the Payments table with columns: Type (badge with dynamic variant), Payer (bold), Gross Amount (currency formatted, green), Net Amount (currency formatted), Method, Notes (truncated), Metadata (popover with Stripe IDs), and Date (formatted)
- The Type column shall use `filterType: 'select'` with values "Team" and "Candidate"
- The Method column shall use `filterType: 'select'` with values "Stripe", "Cash", "Check"
- Cell renderers shall handle currency formatting (`Intl.NumberFormat`), date formatting, badge variant selection, and the `MetadataPopover` component
- A custom `globalFilterFn` shall search across payer, target type, method, gross amount, notes, and payment intent ID
- The Payments table shall use `useDataTableUrlState` for URL state persistence
- The mobile layout shall use `DataTableMobileCard` with payer name (primary), type badge + gross amount (secondary), and net/method/date/notes/metadata in expanded view
- Page size options shall be 5, 10, 20, 50 with a default of 10
- Empty states: "No payments found." (no data) or "No payments found matching your search." (filtered empty)

**Cleanup:**

- The existing ad-hoc `Payments` component shall be fully replaced (same file, rewritten)

**Proof Artifacts:**

- Demo: Payments table renders using DataTable with sort, search, type/method filters, pagination
- Demo: Currency values formatted correctly; badges show correct variants; metadata popover works
- Demo: URL state persists sort/search/filters/page
- Demo: Mobile cards show payer + amount, expand to show all fields
- Build: `yarn build` compiles successfully

### Unit 5: Master Roster Table Migration

**Purpose:** Migrate the Master Roster table, which has row-click sidebar, dynamic experience columns, and currently lacks a mobile layout.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<MasterRosterMember>[]` column definitions for the Master Roster with columns: Name (with user icon), Email, Phone (formatted), Role (comma-separated labels), Level (experience badge with CSS variable colors, conditional), and Rector Ready (icon with star overlay, conditional)
- The Level and Rector Ready columns shall use the `columnVisibility` prop: the parent component shall pass `{ level: canViewExperience, rectorReady: canViewExperience }` to control their visibility based on the `canViewExperience` prop
- The `onRowClick` prop shall open the `UserRoleSidebar` sheet for the clicked member
- A custom `globalFilterFn` shall search across name, email, phone, and role labels
- The Master Roster shall use `useDataTableUrlState` for URL state persistence
- The mobile layout shall use `DataTableMobileCard` with name (primary), role labels (secondary), and email/phone/level/rector-ready in expanded view. The mobile card's `onCardClick` shall open the `UserRoleSidebar`.
- The delete user functionality shall remain in the parent component (triggered from the sidebar, not from the table itself)
- The total members count card and header shall remain above the DataTable
- Page size options shall be 5, 10, 20, 50 with a default of 10
- Empty states: "No users found in the system." (no data) or "No users found matching your search." (filtered empty)

**Cleanup:**

- The existing ad-hoc `MasterRoster` component's table logic shall be fully replaced. The header, count card, sidebar, and delete modal remain.

**Proof Artifacts:**

- Demo: Master Roster renders using DataTable with sort, search, pagination
- Demo: Level and Rector Ready columns show/hide based on `canViewExperience`
- Demo: Clicking a row opens the UserRoleSidebar
- Demo: URL state persists sort/search/page
- Demo: NEW mobile cards show name + roles, expand to show all fields; tapping card opens sidebar
- Build: `yarn build` compiles successfully

### Unit 6: Roles Table Migration

**Purpose:** Migrate the Roles table, which has permission badges, row-click editing, and currently lacks a mobile layout.

**Functional Requirements:**

- The system shall define TanStack Table `ColumnDef<Role>[]` column definitions for the Roles table with columns: Role (with settings icon), Permissions (first 3 as badges + "+N more"), Permission Count, and Actions (edit + delete buttons with `stopPropagation`)
- The `onRowClick` prop shall open the `RolesSidebar` for editing (disabled when `readOnly` is true — when `readOnly`, do not pass `onRowClick` at all)
- A custom `globalFilterFn` shall search by role label and permission names
- The Roles table shall use `useDataTableUrlState` for URL state persistence
- The mobile layout shall use `DataTableMobileCard` with role name (primary), permission count (secondary), and full permission badges + edit/delete actions in expanded view
- The "Add Role" button and header shall remain above the DataTable
- Delete confirmation and sidebar modals shall remain in the parent component
- The read-only mode shall disable all interactive elements (no row click, no edit/delete buttons)
- Empty states: "No roles found in the database." (no data) or "No roles found matching your search." (filtered empty)

**Cleanup:**

- The existing ad-hoc `Roles` component's table logic shall be fully replaced. The header, sidebar, and delete dialog remain.

**Proof Artifacts:**

- Demo: Roles table renders using DataTable with search and row-click editing
- Demo: Permission badges show first 3 with "+N more" pattern
- Demo: Read-only mode disables all interactions
- Demo: URL state persists search state
- Demo: NEW mobile cards show role name + permission count, expand to show permissions and actions
- Build: `yarn build` compiles successfully

### Unit 7: Cleanup Legacy Table Infrastructure

**Purpose:** Remove all legacy table hooks and components that are no longer used by any table after migration.

**Functional Requirements:**

- The system shall delete `hooks/use-table-pagination.ts` if no remaining imports exist
- The system shall delete `components/ui/table-pagination.tsx` if no remaining imports exist
- The system shall verify no other files import from the deleted modules by running a project-wide search
- The system shall delete `components/ui/faceted-filter.tsx` if it was only used by `CandidateTableControls` and has no remaining imports

**Proof Artifacts:**

- Code: No imports of `useTablePagination`, `TablePagination`, or `FacetedFilter` remain in the codebase
- Build: `yarn build` compiles successfully with no missing module errors

## Non-Goals (Out of Scope)

1. **Migrating simple tables**: File browsers (PublicFileTable, FileTable, admin Files), Contact Information table, and Community Board table are too simple to benefit from DataTable and are excluded.
2. **Server-side data operations**: All tables remain client-side. Server-side pagination/sorting/filtering can be added later via TanStack Table's manual modes.
3. **New features beyond parity**: This spec migrates existing functionality to DataTable — no new columns, filters, or capabilities are added beyond what each table already has (except mobile cards for Master Roster and Roles, and URL state for all tables).
4. **Redesigning table UX**: The visual design and information hierarchy of each table remain the same. Only the underlying implementation changes.
5. **Row selection**: TanStack Table row selection (checkboxes) is not needed for any of these tables.

## Design Considerations

**Row Click Interaction:**

- Tables with `onRowClick` shall show `cursor-pointer` on hoverable rows on desktop. Interactive cells (dropdowns, popovers, buttons) shall use `stopPropagation` to prevent triggering row navigation.
- On mobile, `onCardClick` on `DataTableMobileCard` makes the entire collapsed card tappable. The expand/collapse chevron area should still work independently.

**Candidate Review Status Filter:**

- The status column uses TanStack Table's built-in faceted `select` filter (same pattern as the Candidate List payment filter). The "Show Archived" toggle is separate — it controls whether rejected candidates are included in the data array at all, not a column filter.

**Weekend Roster Dynamic Columns:**

- The `columnVisibility` prop merges with permission-derived visibility using AND logic. For example, if `includePaymentInformation` is `false`, the payment column is hidden regardless of permissions. This is implemented at the DataTable level, not by conditionally constructing the columns array.

**New Mobile Cards (Master Roster, Roles):**

- Master Roster cards: Name prominent, role labels as muted secondary text. Expanded view shows email, phone, level badge, rector-ready indicator. Tapping card opens role sidebar.
- Roles cards: Role name prominent, permission count as secondary text. Expanded view shows permission badges. Edit/delete buttons in expanded view (not in collapsed card to avoid accidental actions).

**Pagination Defaults:**

- Roster tables: 10 per page (smaller datasets)
- Candidate Review, Payments: 10 per page (matching current defaults for payments, 25 for candidate review — but standardizing to use the page size selector)

## Repository Standards

- All UI components use shadcn/ui (Radix UI primitives) — no Material-UI or other UI libraries
- Column definition files are co-located with their feature (e.g., `app/(public)/review-candidates/config/columns.tsx`, `components/weekend/roster-view/config/columns.tsx`)
- Client components are marked with `'use client'`
- Dual layout strategy: `hidden md:block` for desktop table, `md:hidden` for mobile cards (handled automatically by `DataTable`)
- Follow TanStack Table's `ColumnDef<TData>` pattern with `accessorFn`, `header` (using `DataTableColumnHeader`), `cell`, and `meta` for custom properties
- Use existing `DataTable` exports from `@/components/ui/data-table`
- Use existing `useDataTableUrlState` from `@/hooks/use-data-table-url-state`

## Technical Considerations

**DataTable `onRowClick` Implementation:**

- Add `onRowClick?: (row: TData) => void` to `DataTableProps`
- In the desktop `TableRow`, add `onClick={() => onRowClick?.(row.original)}` and conditionally apply `cursor-pointer` class
- In mobile, pass to `DataTableMobileCard` as `onCardClick` for the collapsed card area
- Cell renderers for interactive columns (actions, payment popovers) must call `e.stopPropagation()` to prevent bubbling to the row click handler

**DataTable `columnVisibility` Override:**

- Add `columnVisibility?: VisibilityState` to `DataTableProps`
- In the existing `columnVisibility` computation, merge the permission-derived map with the prop-provided map using AND logic: `finalVisibility[colId] = (permissionVisibility[colId] ?? true) && (propVisibility[colId] ?? true)`
- This ensures permissions always take precedence (can never override a permission denial) while allowing feature-level hiding

**Candidate Review "Show Archived" Pattern:**

- The "Show Archived" toggle is a custom control rendered above the DataTable (in the toolbar area via `DataTableToolbar` children prop or as a separate element)
- The toggle state is synced to URL via a separate `useQueryParam('archived', booleanMarshaller)` call
- When `archived` is false (default), filter out rejected candidates from the data array before passing to DataTable
- This is different from a column filter — it's a pre-filter on the data itself

**Custom Sort Functions:**

- Candidate Review status sort: Custom `sortingFn` using `STATUS_ORDER` map
- Weekend/Dropped Roster role sort: Custom `sortingFn` using `CHARole` enum position via `getRoleSortOrder()`
- These are specified per-column via `sortingFn` in the `ColumnDef`

**Column Definition Organization:**

- Each table's column definitions go in a co-located `config/columns.tsx` file
- Custom `globalFilterFn` functions are exported from the same file
- Helper functions (formatters, sort comparators) are defined in the same file or imported from shared utils

## Security Considerations

- No new security concerns. Permission-based column visibility continues to be enforced by the existing DataTable permission model.
- The new `columnVisibility` prop can only hide columns, never reveal columns that permissions would hide (AND logic).
- All data fetching and server actions remain unchanged.

## Success Metrics

1. **All 6 tables migrated**: Every target table renders using `DataTable` with full sort/search/pagination functionality
2. **URL state universal**: Every migrated table has URL-persistent state — bookmarkable and shareable
3. **Mobile coverage complete**: All 6 tables have mobile card layouts via `DataTableMobileCard`
4. **Zero ad-hoc table logic**: `useTablePagination`, `useCandidateReviewTable`, `CandidateTableControls`, and all per-table search/sort/filter `useMemo` logic are deleted
5. **Feature parity**: No existing functionality is lost during migration — all current search, sort, filter, modal, navigation, and action behaviors are preserved
6. **Build health**: `yarn build` compiles successfully after each unit with no new TypeScript errors

## Open Questions

1. Should the Candidate Review's "Show Archived" toggle live inside the `DataTableToolbar` (via `children` prop) or as a separate element above the DataTable? The toolbar's `children` slot would keep it visually grouped with filters; a separate element gives more layout flexibility.
2. For the Weekend Roster's `CHARole` sort, should the sort be toggleable by the user (click to sort by role vs other columns), or should role always be the default/primary sort that other sorts override? Currently it's a fixed sort; with DataTable it would naturally become a toggleable column sort.
