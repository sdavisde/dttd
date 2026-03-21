# 11-tasks-table-migration

## Tasks

### [x] 1.0 DataTable Enhancements (`onRowClick` + `columnVisibility`)

Enhance the shared `DataTable` component with two new props before migrating any tables:

- `onRowClick` prop that adds cursor-pointer styling and click handler to desktop `TableRow`, with `onCardClick` passed through to `DataTableMobileCard` for mobile
- `columnVisibility` override prop that merges with permission-derived visibility using AND logic (both must be `true` for a column to show)

These enhancements are prerequisites for multiple subsequent table migrations (Candidate Review, Weekend Roster, Master Roster, Roles).

#### 1.0 Proof Artifact(s)

- Code: `components/ui/data-table/data-table.tsx` exports `onRowClick` and `columnVisibility` in `DataTableProps`
- Code: `components/ui/data-table/data-table-mobile-card.tsx` exports `onCardClick` in its props
- Code: AND-merge logic visible in the column visibility computation — permission denial can never be overridden by the prop
- CLI: `yarn build` compiles successfully with no new TypeScript errors

#### 1.0 Tasks

- [x] 1.1 Add `onRowClick` prop to `DataTable` — accept `onRowClick?: (row: TData) => void` in `DataTableProps`, apply `cursor-pointer` class and `onClick={() => onRowClick(row.original)}` to each desktop `TableRow` when provided
- [x] 1.2 Add `onCardClick` prop to `DataTableMobileCard` — accept `onCardClick?: (row: TData) => void`, make the collapsed card area clickable with `cursor-pointer`, and pass `onCardClick` from `DataTable` to `DataTableMobileCard`
- [x] 1.3 Add `columnVisibility` override prop to `DataTable` — accept `columnVisibility?: VisibilityState` in `DataTableProps`, merge with permission-derived visibility using AND logic (`(permissionVisibility[colId] ?? true) && (propVisibility[colId] ?? true)`) so permission denial can never be overridden
- [x] 1.4 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 2.0 Candidate Review Table Migration

Migrate the most complex table — Candidate Review — to DataTable. This includes:

- Column definitions with custom status sort (`STATUS_ORDER`), status `filterType: 'select'`, `StatusChip`/`StatusLegend`/`CandidatePaymentInfo` cell renderers, and an actions dropdown with `stopPropagation`
- `onRowClick` for row-level navigation to `/review-candidates/${id}`
- "Show Archived" toggle synced to URL (`?archived=true`) that pre-filters rejected candidates from the data array
- Mobile card layout via `DataTableMobileCard`
- Delete legacy files: `hooks/use-candidate-review-table.ts`, `CandidateTableControls.tsx`, `CandidateTable.tsx`

#### 2.0 Proof Artifact(s)

- Demo: `/review-candidates` renders using DataTable with sort, search, status filter popover (with faceted counts), pagination, and row-click navigation
- Demo: Clicking a row navigates to candidate detail; clicking actions dropdown does NOT navigate
- Demo: "Show Archived" toggle includes/excludes rejected candidates; toggle state persists in URL
- Demo: URL updates as sort/search/filter/page changes; copy-pasting URL restores exact table state
- Demo: Mobile cards show name + status chip, expand to show all fields; sort/filter toolbar works
- CLI: `yarn build` compiles successfully

#### 2.0 Tasks

- [x] 2.1 Create column definitions file `app/(public)/review-candidates/config/columns.tsx` — define `ColumnDef<HydratedCandidate>[]` with columns: Name, Email, Sponsor, Submitted (date), Status (with `StatusChip` cell renderer, `filterType: 'select'`, custom `sortingFn` using `STATUS_ORDER`, and `StatusLegend` popover in header), Payment (with `CandidatePaymentInfo` cell renderer), Actions (dropdown with View Details, Send Forms, Request Payment, Reject). Export `candidateReviewGlobalFilterFn` searching name, email, and sponsor.
- [x] 2.2 Rewrite `CandidateReviewTable.tsx` to use `DataTable` — replace `useCandidateReviewTable` + `CandidateTableControls` + `CandidateTable` + `TablePagination` with `DataTable` using `useDataTableUrlState`, `onRowClick` for row navigation, column definitions from 2.1. Add "Show Archived" toggle as a `useQueryParam('archived', booleanMarshaller)` that pre-filters rejected candidates from the data array. Pass modal callbacks to action column via closure.
- [x] 2.3 Delete legacy files — remove `hooks/use-candidate-review-table.ts`, `app/(public)/review-candidates/components/CandidateTableControls.tsx`, `app/(public)/review-candidates/components/CandidateTable.tsx`
- [x] 2.4 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 3.0 Weekend Roster + Dropped Roster Table Migration

Migrate both roster tables together since they share the same data model (`WeekendRosterMember`), the same custom `CHARole` sort function, and live in the same directory. Includes:

- **Weekend Roster:** Column definitions with role sort, forms checkbox, medical modal button, payment info, edit modal button. Dynamic columns via `columnVisibility` prop (`payment: includePaymentInformation`, `actions: isEditable`). Custom `globalFilterFn`.
- **Dropped Roster:** Simpler column set (Name, Email, Phone, Role, Rollo, Status badge). Pre-filtered to `status === 'drop'`.
- Both tables get `useDataTableUrlState` and mobile card layouts via `DataTableMobileCard`.

#### 3.0 Proof Artifact(s)

- Demo: Weekend Roster renders using DataTable with role-based sort, search, pagination
- Demo: Payment and Actions columns show/hide based on `includePaymentInformation` and `isEditable` props
- Demo: Edit button opens modal; medical button opens modal; payment popover works — none trigger row-level side effects
- Demo: Dropped Roster renders using DataTable; only dropped members shown
- Demo: URL state persists sort/search/page on both tables; back button works
- Demo: Mobile cards work on both tables with DataTableMobileCard
- CLI: `yarn build` compiles successfully

#### 3.0 Tasks

- [x] 3.1 Create shared roster column helpers — create `components/weekend/roster-view/config/columns.tsx` with: CHARole sort function (`getRoleSortOrder` using `Object.values(CHARole).indexOf`), shared name accessor (`${users.first_name} ${users.last_name}`), and `rosterGlobalFilterFn` searching name, email, phone, role, status, rollo
- [x] 3.2 Create Weekend Roster column definitions — in the same file, export `getWeekendRosterColumns(callbacks)` returning `ColumnDef<WeekendRosterMember>[]` with columns: Name (`mobilePriority: 'primary'`), Phone, Role (with rollo suffix, custom `sortingFn`), Forms (disabled `Checkbox`), Emergency Contact, Medical (`Stethoscope` button with `stopPropagation`), Payment (`PaymentInfo` with `stopPropagation`), Actions (Edit button with `stopPropagation`). Mark Payment and Actions columns with `id: 'payment'` and `id: 'actions'` for visibility control.
- [x] 3.3 Create Dropped Roster column definitions — in the same file, export `droppedRosterColumns` as `ColumnDef<WeekendRosterMember>[]` with columns: Name (`mobilePriority: 'primary'`), Email, Phone, Role, Rollo, Status (hardcoded `Badge variant="destructive"` showing "Dropped")
- [x] 3.4 Rewrite `WeekendRosterTable` to use `DataTable` — replace manual table/pagination/search with `DataTable` using `useDataTableUrlState`, column defs from 3.2, `columnVisibility={{ payment: includePaymentInformation, actions: isEditable }}`, pre-filter `status !== 'drop'` on data array. Keep `EditTeamMemberModal` and `MedicalInfoModal` with same state management. Pass modal callbacks via closure to column factory.
- [x] 3.5 Rewrite `DroppedRosterTable` to use `DataTable` — replace manual table/pagination/search with `DataTable` using `useDataTableUrlState`, column defs from 3.3, pre-filter `status === 'drop'` on data array. Use `searchPlaceholder="Search dropped members..."`.
- [x] 3.6 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 4.0 Payments Table Migration

Migrate the Payments table to DataTable. Includes:

- Column definitions with custom formatters (currency via `Intl.NumberFormat`, date formatting), badge variants for payment type, `MetadataPopover` cell renderer
- `filterType: 'select'` on Type (Team/Candidate) and Method (Stripe/Cash/Check) columns
- Custom `globalFilterFn` searching payer, type, method, amount, notes, payment intent ID
- `useDataTableUrlState` for URL persistence
- Mobile card layout via `DataTableMobileCard`

#### 4.0 Proof Artifact(s)

- Demo: Payments table renders using DataTable with sort, search, type/method filter popovers, pagination
- Demo: Currency values formatted correctly; badges show correct variants; metadata popover works
- Demo: URL state persists sort/search/filters/page
- Demo: Mobile cards show payer + amount, expand to show all fields
- CLI: `yarn build` compiles successfully

#### 4.0 Tasks

- [x] 4.1 Create Payments column definitions — create `app/admin/payments/config/columns.tsx` with `ColumnDef<PaymentTransactionDTO>[]`: Type (`filterType: 'select'`, `Badge` with variant from `getTargetTypeBadgeColor`, accessor returns formatted "Team"/"Candidate"/"Other"), Payer (`payment_owner`, `mobilePriority: 'primary'`), Gross (`gross_amount`, `Intl.NumberFormat` currency, green text), Net (`net_amount`, currency), Method (`filterType: 'select'`, formatted "Stripe"/"Cash"/"Check"), Notes (truncated `max-w-[200px]`), Meta (`MetadataPopover` inline component with `stopPropagation`), Date (`created_at`, formatted with `toLocaleDateString`). Export `paymentsGlobalFilterFn` searching payer, type, method, amount, notes, payment intent ID.
- [x] 4.2 Rewrite `Payments.tsx` to use `DataTable` — replace manual table/pagination/search/mobile layout with `DataTable` using `useDataTableUrlState`, column defs from 4.1, `user={null}`. Move `MetadataPopover` to the columns file. Remove `useTablePagination` and `TablePagination` imports.
- [x] 4.3 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 5.0 Master Roster Table Migration

Migrate the Master Roster table and add a NEW mobile card layout (currently desktop-only). Includes:

- Column definitions with user icon, formatted phone, comma-separated role labels, experience level badge (CSS variable colors), rector-ready icon
- `columnVisibility` prop for Level and Rector Ready columns based on `canViewExperience`
- `onRowClick` to open `UserRoleSidebar`; `onCardClick` on mobile cards
- Custom `globalFilterFn` searching name, email, phone, role labels
- `useDataTableUrlState` for URL persistence
- NEW mobile card layout: name (primary), role labels (secondary), email/phone/level/rector-ready in expanded view

#### 5.0 Proof Artifact(s)

- Demo: Master Roster renders using DataTable with sort, search, pagination
- Demo: Level and Rector Ready columns show/hide based on `canViewExperience`
- Demo: Clicking a row opens UserRoleSidebar
- Demo: URL state persists sort/search/page
- Demo: NEW mobile cards show name + roles, expand to show all fields; tapping card opens sidebar
- CLI: `yarn build` compiles successfully

#### 5.0 Tasks

- [x] 5.1 Create Master Roster column definitions — create `app/admin/users/config/columns.tsx` with `ColumnDef<MasterRosterMember>[]`: Name (`UserIcon` + formatted name, `mobilePriority: 'primary'`), Email, Phone (`formatPhoneNumber`), Role (comma-joined `roles.map(r => r.label)`, `mobilePriority: 'secondary'`), Level (centered `Badge` with CSS variable colors `var(--experience-level-${level})`, `id: 'level'`), Rector Ready (centered check/star/dash icon, `id: 'rectorReady'`). Export `masterRosterGlobalFilterFn` searching name, email, phone, role labels (use `.some(label => label.toLowerCase().includes(query))` instead of `.includes(query)` for proper substring matching).
- [x] 5.2 Rewrite `master-roster.tsx` to use `DataTable` — replace manual table/pagination/search with `DataTable` using `useDataTableUrlState`, column defs from 5.1, `columnVisibility={{ level: canViewExperience, rectorReady: canViewExperience }}`, `onRowClick` to open `UserRoleSidebar`. Keep `UserRoleSidebar` and delete user `Dialog` with same state management. Remove `useTablePagination`/`TablePagination` imports. Pass `user={null}` (visibility handled via prop, not permission).
- [x] 5.3 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 6.0 Roles Table Migration

Migrate the Roles table and add a NEW mobile card layout (currently desktop-only). Includes:

- Column definitions with settings icon, permission badges (first 3 + "+N more"), permission count, edit/delete action buttons with `stopPropagation`
- `onRowClick` to open `RolesSidebar` (disabled when `readOnly` — don't pass prop at all)
- Custom `globalFilterFn` searching role label and permission names
- `useDataTableUrlState` for URL persistence
- Read-only mode disables all interactive elements
- NEW mobile card layout: role name (primary), permission count (secondary), permission badges + edit/delete in expanded view

#### 6.0 Proof Artifact(s)

- Demo: Roles table renders using DataTable with search and row-click editing
- Demo: Permission badges show first 3 with "+N more" pattern
- Demo: Read-only mode disables all interactions (no row click, no edit/delete)
- Demo: URL state persists search state
- Demo: NEW mobile cards show role name + permission count, expand to show permissions and actions
- CLI: `yarn build` compiles successfully

#### 6.0 Tasks

- [x] 6.1 Create Roles column definitions — create `app/admin/roles/config/columns.tsx` with `getRolesColumns(callbacks)` returning `ColumnDef<Role>[]`: Role (`Settings` icon + `role.label`, `mobilePriority: 'primary'`), Permissions (first 3 as `Badge variant="outline"` + "+N more" span, `mobilePriority: 'secondary'`), Permission Count (`role.permissions.length` + "permission(s)" text), Actions (Edit + Delete buttons with `stopPropagation`, `enableSorting: false`, disable when `readOnly`). Export `rolesGlobalFilterFn` searching role label and permission names.
- [x] 6.2 Rewrite `Roles.tsx` to use `DataTable` — replace manual table/search with `DataTable` using `useDataTableUrlState`, column defs from 6.1, `onRowClick` (only when `!readOnly` — pass `undefined` when readOnly), `user={null}`. Keep `RolesSidebar`, `DeleteConfirmationDialog`, and "Add Role" button as `toolbarChildren`. Pass callbacks via closure to column factory. Remove header/description section (keep existing page structure).
- [x] 6.3 Verify build — run `yarn build` and confirm no new TypeScript errors

---

### [x] 7.0 Cleanup Legacy Table Infrastructure

Remove all legacy table hooks and components that are no longer used after all migrations. Includes:

- Delete `hooks/use-table-pagination.ts` (after verifying no remaining imports)
- Delete `components/ui/table-pagination.tsx` (after verifying no remaining imports)
- Delete `components/ui/faceted-filter.tsx` (after verifying no remaining imports)
- Project-wide search to confirm zero remaining references

#### 7.0 Proof Artifact(s)

- CLI: `grep -r "useTablePagination\|TablePagination\|FacetedFilter\|faceted-filter\|table-pagination\|use-table-pagination" --include="*.ts" --include="*.tsx"` returns no results (excluding the deleted files themselves)
- CLI: `yarn build` compiles successfully with no missing module errors
- Diff: Deleted files listed in git diff

#### 7.0 Tasks

- [x] 7.1 Verify no remaining imports — run project-wide grep for `useTablePagination`, `TablePagination`, `FacetedFilter`, `faceted-filter`, `table-pagination`, `use-table-pagination` across all `.ts` and `.tsx` files. Document any remaining references.
- [x] 7.2 Delete legacy files — remove `hooks/use-table-pagination.ts`, `components/ui/table-pagination.tsx`, `components/ui/faceted-filter.tsx`
- [x] 7.3 Verify build — run `yarn build` and confirm no missing module errors
