# 10 Questions Round 1 - Server-Side Table Infrastructure

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Scope Split

I recommend splitting this into two specs: (1) Build the foundation + migrate 1-2 tables, (2) Migrate remaining tables. Does that work?

- [x] (A) Yes, build the foundation and prove it on 1-2 tables first
- [ ] (B) No, I want all tables migrated in one spec
- [ ] (C) Other (describe)

## 2. Which Tables to Start With?

If we're proving the pattern on 1-2 tables, which ones make the most sense to start with? Currently these tables have the most features (search, sort, filter, pagination, mobile):

- [x] (A) Candidate List (public) — most complex: multi-column sort, fuzzy search, pagination, mobile cards, permission-based columns
- [ ] (B) Candidate Review — has status filtering, archived toggle, sort, search
- [ ] (C) Payments — search, pagination, mobile cards, relatively simple
- [ ] (D) Weekend Roster — search, role-based sort, pagination, mobile cards, payment info
- [ ] (E) Other (describe)

## 3. Headless Table Library

You mentioned "headless UI" for sharing sort/filter logic. Are you thinking:

- [x] (A) TanStack Table (headless, very popular, supports server-side mode out of the box) — this is a natural fit since you already use TanStack Query.
- we can try this, but this should be early in the spec as a point of discovery to determine if this will serve our needs or not.
- [ ] (B) Custom headless hooks (build our own `useDataTable` hook with sort/filter/pagination state)
- [ ] (C) No preference — whatever makes sense given the codebase
- [ ] (D) Other (describe)

## 4. Server-Side Query API Shape

For the generic server-side query interface that actions implement, what feels right?

- [ ] (A) A single generic function signature that all table actions conform to, e.g. `queryTable<T>(params: { filters, sort, pagination, search }) => Result<Error, PaginatedResult<T>>`
- [ ] (B) Each action implements its own version but follows a shared TypeScript interface/contract
- [ ] (C) A base utility/helper that actions compose with (handles Supabase query building, pagination math, etc.)
- [x] (D) No preference — whatever results in the least boilerplate
- [ ] (E) Other (describe)

## 5. Filter UI Design

For the sort/filter UI that users interact with, what are you imagining?

- [ ] (A) Filter bar above the table with dropdowns/chips (similar to what Candidate Review has with its status faceted filter, but generalized)
- [ ] (B) Filter sidebar/sheet that slides out with all filter options
- [x] (C) Column header controls (click header to sort, filter icon per column)
- [ ] (D) Combination — column headers for sort, filter bar for filters
- [ ] (E) No strong preference — show me something and I'll know if it's right (you mentioned "I'll know more when I see it")

## 6. Search Approach

Currently all search is client-side fuzzy matching (`String.includes(query.toLowerCase())`). For server-side:

- [ ] (A) Supabase full-text search (PostgreSQL `tsvector`/`tsquery`) — powerful but requires DB setup per table
- [x] (B) Supabase `ilike` pattern matching — simple, works well for most cases, no DB changes needed
- [ ] (C) Keep search client-side for now, only move sort/filter/pagination server-side
- [ ] (D) Start with `ilike` and upgrade to full-text search later if needed
- [ ] (E) Other (describe)

## 7. URL State Persistence

Should sort, filter, and pagination state be reflected in the URL (query params)?

- [x] (A) Yes — URL should reflect all table state so users can bookmark/share filtered views and browser back/forward works
- [ ] (B) Partial — only persist filters and search in URL, reset pagination on navigation
- [ ] (C) No — keep state in React state only (current approach)
- [ ] (D) Other (describe)

## 8. Pagination Style

Current tables use offset-based pagination with page size selector. Any changes desired?

- [x] (A) Keep current offset pagination with page size selector (works well with server-side)
- [ ] (B) Switch to cursor-based pagination (better for real-time data, but no random page access)
- [ ] (C) Add infinite scroll option alongside traditional pagination
- [ ] (D) No preference
- [ ] (E) Other (describe)

## 9. Loading States

Moving to server-side means network round-trips for sort/filter/page changes. How should we handle loading?

- [ ] (A) Show skeleton/shimmer in the table body while loading (keeps layout stable)
- [ ] (B) Subtle loading indicator (spinner in corner or progress bar) while keeping stale data visible
- [x] (C) Both — skeleton for initial load, subtle indicator for subsequent interactions
- [ ] (D) No preference
- [ ] (E) Other (describe)

## 10. Mobile Sort/Filter

On mobile (where we show cards instead of tables), how should sort/filter work?

- [ ] (A) Sticky filter bar at top of card list with same controls as desktop
- [x] (B) Filter/sort accessible via a floating action button or icon that opens a bottom sheet
- [ ] (C) Simplified — just search + most important filter on mobile, full controls on desktop
- [ ] (D) Same controls as desktop, just stacked vertically
- [ ] (E) Other (describe)
