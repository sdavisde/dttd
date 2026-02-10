# 11 Questions Round 1 - Table Migration

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Which Tables to Migrate

Based on my analysis, I've categorized all 13 non-candidate-list tables. Do you agree with this breakdown?

**Migrate (complex enough to benefit):**
- Weekend Roster Table (`components/weekend/roster-view/weekend-roster-table.tsx`)
- Dropped Roster Table (`components/weekend/roster-view/dropped-roster-table.tsx`)
- Candidate Review Table (`app/(public)/review-candidates/components/`)
- Payments Table (`app/admin/payments/components/Payments.tsx`)
- Master Roster Table (`app/admin/users/components/master-roster.tsx`)
- Roles Table (`app/admin/roles/components/Roles.tsx`)

**Skip (too simple, DataTable would be overkill):**
- Public File Table (`components/public-files/PublicFileTable.tsx`) — basic file browser
- Admin File Table (`components/file-management/FileTable.tsx`) — basic file browser with delete
- Community Board Table (`app/admin/community-board/page.tsx`) — static hardcoded data (2 rows)
- Admin Files Folder List (`app/admin/files/components/Files.tsx`) — simple folder browser
- Public Files Folder List (`app/(public)/files/page.tsx`) — read-only folder list

- [x] (A) Agree with this breakdown as-is
- [ ] (B) Move some "Skip" tables into "Migrate" (specify which)
- [ ] (C) Move some "Migrate" tables into "Skip" (specify which)
- [ ] (D) Other (describe)

## 2. Row Actions and Interactivity

Several tables have complex row-level interactions (modals, navigation, action dropdowns). How should these work with DataTable?

- **Weekend Roster**: Edit modal, medical info modal, payment info popover
- **Candidate Review**: Row click navigation, dropdown with Send Forms/Request Payment/Reject actions, confirmation modals
- **Master Roster**: Row click to open role sidebar, delete modal
- **Roles**: Row click to edit, delete confirmation

- [x] (A) Keep all existing row-level interactions as-is — just wrap them in DataTable column definitions using `cell` renderers. DataTable doesn't need to "know about" modals/navigation; the cell components handle that themselves.
- [x] (B) Add formal support to DataTable for row actions (e.g., a `rowAction` prop or `onRowClick` handler built into the DataTable component)
- [ ] (C) Simplify — some of these interactions should be rethought during migration (describe which)
- [x] (D) Other (describe) - Both A and B. Data table should support "rowAction" prop which allows for redirecting the user to a new page with a loading state if provided, but for generic cell-level interactions like payment popover and actions icons, we can use the `cell` renderer to handle these interactions.

## 3. Candidate Review Table Complexity

The Candidate Review table is the most complex — it has a custom `useCandidateReviewTable` hook managing search, multi-status filters, archived toggle, sort, and pagination, plus confirmation modals that trigger server actions. How should this migrate?

- [ ] (A) Full migration — replace `useCandidateReviewTable` entirely with DataTable + `useDataTableUrlState`, move server action logic to the parent component
- [ ] (B) Partial migration — use DataTable for rendering/sorting/pagination but keep the status filter and archived toggle as custom controls in the toolbar
- [ ] (C) Skip for now — this table is complex enough to warrant its own follow-up spec
- [x] (D) Other (describe) - We should use datatable for filter/sort/pagination, and we should make the status column filterable by select. The actions column at the end can be rendered using `cell` renderer.

## 4. URL State for All Tables

Should all migrated tables get URL state persistence, or only some?

- [x] (A) All migrated tables get URL state via `useDataTableUrlState` — consistent behavior, all views are shareable/bookmarkable
- [ ] (B) Only tables where URL state adds clear value (e.g., Candidate Review, Payments) — simpler tables can use internal state only
- [ ] (C) Make it opt-in per table — define in the spec which tables get URL state
- [ ] (D) Other (describe)

## 5. Mobile Card Layouts

Some tables already have mobile card layouts, some don't. What's the priority?

**Already have mobile cards:**
- Weekend Roster Table, Dropped Roster Table, Candidate Review Table, Payments Table

**Missing mobile cards:**
- Master Roster Table, Roles Table

- [x] (A) Migrate all existing mobile cards to DataTableMobileCard pattern AND add new mobile cards for tables that don't have them (Master Roster, Roles)
- [ ] (B) Migrate existing mobile cards to DataTableMobileCard pattern, but don't add new ones for tables that don't have them yet
- [ ] (C) Keep existing mobile card implementations as-is (just co-locate with DataTable), focus migration on desktop table logic
- [ ] (D) Other (describe)

## 6. Weekend Roster Dynamic Columns

The Weekend Roster table has dynamic columns — it conditionally shows/hides the "Payment" column based on `includePaymentInformation` prop and the "Actions" column based on `isEditable` prop. This is different from the permission model (which uses `meta.requiredPermission`). How should this be handled?

- [x] (A) Use the existing permission model — map `isEditable` and `includePaymentInformation` to computed `columnVisibility` state passed to DataTable
- [ ] (B) Add a new `columnVisibility` prop to DataTable that accepts an explicit visibility map (separate from permission-based visibility)
- [ ] (C) Filter the columns array before passing to DataTable — conditionally include/exclude columns at the definition level
- [ ] (D) Other (describe)

## 7. Demoable Unit Ordering

How would you like the migration work organized?

- [x] (A) One unit per table — 6 separate demoable units, each migrating one table independently (parallel-friendly, easy to validate)
- [ ] (B) Grouped by complexity — Unit 1: DataTable enhancements, Unit 2: simple tables (Dropped Roster, Roles), Unit 3: medium tables (Payments, Master Roster, Weekend Roster), Unit 4: complex table (Candidate Review)
- [ ] (C) Grouped by feature area — Unit 1: Roster tables (Weekend + Dropped), Unit 2: Admin tables (Payments, Master Roster, Roles), Unit 3: Candidate Review
- [ ] (D) Other (describe)

## 8. DataTable Infrastructure Enhancements

Based on my analysis, these enhancements to the shared DataTable infrastructure may be needed. Which do you want included in this spec?

- [x] (A) **Row click handler** — `onRowClick` prop for tables where clicking a row navigates or opens a sidebar
- [ ] (B) **Conditional row styling** — `rowClassName` prop or callback for applying styles based on row data (e.g., candidate review status colors)
- [x] (C) **Column visibility prop** — explicit `columnVisibility` override separate from permission model (for dynamic columns like Weekend Roster)
- [ ] (D) All of the above
- [ ] (E) None — handle these at the column definition / cell renderer level without changing DataTable
- [ ] (F) Other (describe)

## 9. Cleanup After Migration

After migrating tables, what cleanup should be done?

- [x] (A) Delete all replaced custom hooks and components (e.g., `useCandidateReviewTable`, custom `TableControls`, etc.) — clean break
- [ ] (B) Keep old implementations alongside new ones temporarily (feature flag or A/B)
- [ ] (C) Delete custom hooks but keep the shared `useTablePagination` and `TablePagination` components until ALL tables are migrated
- [ ] (D) Other (describe)
