# 10 Questions Round 2 - TanStack Table Infrastructure

These follow-up questions are based on your feedback about permissions, mobile UX, and the shared API.

## 1. Permission API Shape

You want a consistent, reusable API for column permissions in the headless hooks. Which of these feels right for how permissions are declared per column?

- [x] (A) In the `ColumnDef` `meta` object — e.g. `meta: { requiredPermission: Permission.READ_CANDIDATE_CONTACT_INFO }` — the shared DataTable reads this and computes visibility automatically from the user
- [ ] (B) A separate permission map passed to the DataTable — e.g. `columnPermissions={{ email: Permission.READ_CANDIDATE_CONTACT_INFO, phone: Permission.READ_CANDIDATE_CONTACT_INFO }}` — keeps permission config separate from column definitions
- [ ] (C) No preference — whatever is cleanest
- [ ] (D) Other (describe)

## 2. Permission-Restricted Columns and Sort/Filter

You said "permission is only on the VIEW of a column" and the table should still sort/filter by columns the user can't see. Just to confirm the intended behavior:

A user without `READ_CANDIDATE_CONTACT_INFO` opens a link with `?sort=email&dir=asc&filter.email=john`:

- The table IS sorted by email and filtered to "john" (data operations still apply)
- The email column IS NOT visible in the table/cards
- The user sees the sort/filter is active (e.g., in the toolbar) but can't see the column it's on

Is that the correct behavior?

- [x] (A) Yes, exactly — sort/filter work on hidden columns, user just can't see the column data
- [ ] (B) No — if a user can't see a column, sort/filter on that column should be silently ignored
- [ ] (C) Partially — sort on hidden columns is fine, but filter on hidden columns should be ignored (since the user can't understand what's being filtered)
- [ ] (D) Other (describe)

## 3. URL State Persistence (Revisited)

In the previous round you wanted full URL state persistence. I moved it to non-goals in the revised spec to keep scope down, but your permission feedback explicitly references URLs (`?sort=email&dir=asc`). Should URL state persistence be back in scope?

- [x] (A) Yes, bring it back in scope — URL state is important for the sharing use case and the permission behavior I described
- [ ] (B) No, keep it out of scope for now — I was just using URL examples to illustrate the permission concept
- [ ] (C) Other (describe)

## 4. Mobile UX Direction

You said you don't love the current card layout but know tables are worse on mobile. What direction appeals to you?

- [x] (A) **Expandable row cards** — show a compact summary (name + 1-2 key fields) for each row, tap to expand and see all fields. Keeps the list scannable while allowing full detail access.
- [ ] (B) **Detail sheet** — show a compact list (like a contact list: name + subtitle), tap a row to open a bottom sheet or slide-over with all the row's details in a readable layout
- [ ] (C) **Responsive table with horizontal scroll** — use an actual table on mobile but with sticky first column (name) and horizontal scroll for remaining columns. More data visible at once, but requires scrolling.
- [x] (D) **Keep cards but improve density** — smaller cards with better information hierarchy (bold name, smaller secondary info, badges for status). Easier than rethinking the whole layout.
- [ ] (E) Other (describe)

## 5. Mobile Sort/Filter Controls

Separate from the data display, you previously chose a bottom sheet for sort/filter on mobile. Still good with that, or does the mobile UX rethink change anything?

- [ ] (A) Bottom sheet is still good — sort/filter controls in a sheet, data display is a separate concern
- [x] (B) Integrate sort/filter into the mobile data display somehow (e.g., swipe gestures, inline controls)
- [ ] (C) No preference — focus on making the data display great first, sort/filter can follow whatever pattern makes sense
- [ ] (D) Other (describe)

## 6. Pagination — Always Show

You said pagination should always show regardless of row count. Should it show the full control set even when there's only 1 page?

- [x] (A) Yes, always show the full pagination bar (page size selector, page numbers, prev/next) even with 1 page — consistent UI, users always know where to find it
- [ ] (B) Always show the bar, but disable/grey out nav buttons when there's only 1 page — present but clearly not actionable
- [ ] (C) Always show page size selector (so users can change density), but hide page nav when there's only 1 page
- [ ] (D) Other (describe)

## 7. Global Search vs Column Filters

With per-column filters now in scope, how should the global search box interact with column filters?

- [x] (A) **Both active simultaneously** — global search narrows the full dataset, column filters narrow further within those results (AND logic between global search and column filters)
- [ ] (B) **Global search replaces column filters** — when you type in global search, column filters are cleared and vice versa
- [ ] (C) **Global search only, no per-column text filters** — use the global search for text search, per-column filters only for enum/select values (payment status, etc.)
- [ ] (D) Other (describe)
