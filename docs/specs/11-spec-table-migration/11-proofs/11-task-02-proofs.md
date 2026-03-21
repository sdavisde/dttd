# Task 2.0 Proofs — Candidate Review Table Migration

## Code: Column definitions with custom sort, filter, and cell renderers

File: `app/(public)/review-candidates/config/columns.tsx`

- 7 columns: Name, Email, Sponsor, Submitted, Status, Payment, Actions
- Status column: `filterType: 'select'`, custom `statusSortingFn` using `STATUS_ORDER`
- Status column: `accessorFn` returns human-readable labels for filter display
- Status column header: includes `StatusLegend` popover with Info icon
- Payment column: renders `CandidatePaymentInfo` with `stopPropagation`
- Actions column: dropdown with View Details, Send Forms, Request Payment, Reject — all with `stopPropagation`
- `candidateReviewGlobalFilterFn` searches name, email, sponsor

## Code: CandidateReviewTable rewritten with DataTable

File: `app/(public)/review-candidates/components/CandidateReviewTable.tsx`

- Uses `DataTable` with `useDataTableUrlState` for URL-persistent state
- `onRowClick` navigates to `/review-candidates/${candidate.id}`
- "Show Archived" toggle via `useQueryParam('archived', booleanMarshaller)`
- Pre-filters rejected candidates from data when archived is off
- `toolbarChildren` renders the Show Archived checkbox inline in the toolbar
- Default sort: status ascending (action-priority order)
- Default page size: 25
- Empty states with Users icon and "Clear filters" button
- Column definitions created via `getCandidateReviewColumns()` factory with modal callbacks
- All 3 confirmation modals preserved (Send Forms, Send Payment Request, Reject)

## Code: Mobile card layout

Via `DataTableMobileCard` metadata:

- Primary: Name (`mobilePriority: 'primary'`)
- Secondary: Status chip (`mobilePriority: 'secondary'`)
- Detail: Email, Sponsor, Submitted, Payment (`mobilePriority: 'detail'`)

## Deleted Files

- `hooks/use-candidate-review-table.ts`
- `app/(public)/review-candidates/components/CandidateTableControls.tsx`
- `app/(public)/review-candidates/components/CandidateTable.tsx`

## CLI: `yarn build` output

```
✓ Compiled successfully in 9.8s
✓ Generating static pages using 7 workers (42/42) in 423.5ms
Done in 32.58s.
```

No TypeScript errors. Build compiles successfully.
