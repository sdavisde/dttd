# 13-tasks-roster-builder

## Tasks

### [x] 1.0 Draft Roster Data Model & Service Layer

Set up the `draft_weekend_roster` database table, Supabase migration, RLS policies, and the full service layer (repository → service → actions) for draft CRUD and finalization. This unit has no UI — it's the data foundation everything else builds on.

#### 1.0 Proof Artifact(s)

- Database: Migration file at `supabase/migrations/<timestamp>_draft_weekend_roster.sql` creates table with correct schema, foreign keys, unique constraint (weekend_id + user_id), and RLS policies
- CLI: `yarn db:generate` succeeds and `database.types.ts` includes the new `draft_weekend_roster` table types
- CLI: `npx tsc --noEmit` passes with zero errors after adding all service layer files
- Manual test: Calling `addDraftRosterMember`, `getDraftRoster`, `removeDraftRosterMember`, and `finalizeDraftRosterMember` via a temporary test page or script demonstrates the full draft lifecycle (create → read → finalize creates `weekend_roster` + `weekend_group_members` rows → draft archived)

#### 1.0 Tasks

- [x] 1.1 Create `supabase/migrations/20260411000000_draft_weekend_roster.sql` — table with `id`, `weekend_id` (FK), `user_id` (FK), `cha_role`, `rollo`, `created_by` (FK), `created_at`, `finalized_at`; unique constraint on `(weekend_id, user_id)`; RLS policies for authenticated CRUD; grants
- [x] 1.2 Run `yarn db:generate` to update `database.types.ts` with new table types
- [x] 1.3 Create `services/draft-roster/repository.ts` — `insertDraft`, `findDraftsByWeekendId`, `findDraftById`, `deleteDraft`, `markDraftFinalized` functions returning `Result<string, T>`
- [x] 1.4 Create `services/draft-roster/draft-roster-service.ts` — `addDraftRosterMember`, `getDraftRoster`, `removeDraftRosterMember`, `finalizeDraftRosterMember` with rector authorization checks and finalization flow (creates `weekend_roster` + `weekend_group_members` rows, archives draft)
- [x] 1.5 Create `services/draft-roster/actions.ts` (server actions with rector auth) and `services/draft-roster/index.ts` (public exports)
- [x] 1.6 Verify `npx tsc --noEmit` passes with zero errors

---

### [x] 2.0 Community Data Fetching & Eligibility System

Build the server action that fetches all community members with their experience, secuela attendance, current assignment status (roster + draft), and computed eligibility flags. Implement the extendable eligibility checking system.

#### 2.0 Proof Artifact(s)

- CLI: `npx tsc --noEmit` passes with zero errors
- Manual test: `getRosterBuilderCommunityData(weekendId)` returns correctly shaped data including: user info, experience records, `experienceLevel`, `rectorReadyStatus`, `hasBeenSectionHead`, `hasGivenRollo`, `attendsSecuela`, `assignmentStatus` (unassigned / draft / finalized), and `eligibility` map per relevant role
- Code: Eligibility system implemented as an extendable map (`CHARole → check function`) in a dedicated file, with Head/Asst Head and Rover rules as the initial entries

#### 2.0 Tasks

- [x] 2.1 Create `services/roster-builder/types.ts` — define `RosterBuilderCommunityMember` type with user info, experience records, computed flags (experienceLevel, rectorReadyStatus, hasBeenSectionHead, hasGivenRollo, attendsSecuela, assignmentStatus), and eligibility map
- [x] 2.2 Create `services/roster-builder/eligibility.ts` — extendable eligibility system as a map of `CHARole → check function` with Head/Asst Head and Rover rules
- [x] 2.3 Create `services/roster-builder/repository.ts` — query to fetch all users with experience, secuela attendance, and current assignment status (roster + draft)
- [x] 2.4 Create `services/roster-builder/roster-builder-service.ts` — `getRosterBuilderCommunityData(weekendId)` that fetches, computes, and returns fully shaped community data
- [x] 2.5 Create `services/roster-builder/actions.ts` and `services/roster-builder/index.ts` — server action exports
- [x] 2.6 Verify `npx tsc --noEmit` passes with zero errors

---

### [x] 3.0 Roster Builder Page — Kanban Board with Real Data

Replace the mock-data prototype with the real data layer. Wire up the server page component (auth + rector check + data fetching), adapt the existing `design-a-kanban-drawer.tsx` client component to accept real data as props, and implement the roster template with add/remove slot functionality. This is the core UI deliverable.

#### 3.0 Proof Artifact(s)

- Screenshot: `/roster-builder` page loads for a rector user showing the kanban board with real roster data (existing `weekend_roster` assignments shown as finalized, `draft_weekend_roster` entries shown as drafts with dashed borders), stats header with accurate counts, and empty template slots
- Screenshot: Clicking an empty slot opens the assignment popover showing real community members with experience, secuela badges, and eligibility warnings
- Screenshot: Assigning a member from the popover creates a draft (dashed border card) — refreshing the page persists the draft
- Screenshot: "Add Position" button at bottom of a category column opens dropdown to select a CHA role
- CLI: `yarn lint` and `npx tsc --noEmit` pass with zero errors

#### 3.0 Tasks

- [x] 3.1 Create the default roster template constant (`roster-template.ts`) — array of `{ category, role, rollo?, required }` objects matching the mock data categories
- [x] 3.2 Create the server page component (`page.tsx`) — auth check, rector verification, data fetching (community data + draft roster + weekend info), pass props to client component
- [x] 3.3 Adapt the kanban board client component to accept real data props — replace mock imports with typed props, map `RosterBuilderCommunityMember` to slot display, distinguish draft vs finalized slots visually
- [x] 3.4 Wire up server actions for assign (addDraftRosterMember) and remove (removeDraftRosterMember) with optimistic UI updates
- [x] 3.5 Implement "Add Position" button at bottom of each category column with CHA role dropdown
- [x] 3.6 Verify `yarn lint` and `npx tsc --noEmit` pass with zero errors

---

### [ ] 4.0 Community Drawer Panel with Real Data

Implement the slide-out Sheet panel with filterable community browser, rich member detail cards, and the "Assign to..." flow — all wired to real data from the community data action.

#### 4.0 Proof Artifact(s)

- Screenshot: "Browse Community" button opens the Sheet showing all community members with experience details, eligibility badges, and filter controls
- Screenshot: Applying filters (e.g., "Attends Secuela" + "Experienced") correctly narrows the member list with "Showing X of Y" counter updating
- Screenshot: Clicking "Assign to..." on a member shows available empty slots grouped by category with eligibility warnings for ineligible roles
- Screenshot: Assigning from the drawer creates a draft and the member's card shows grayed-out with their assignment

#### 4.0 Tasks

TBD

---

### [ ] 5.0 Draft Finalization & Removal Flows

Implement the finalization confirmation dialog, the draft removal action, and the finalized member drop/remove menu. This completes the full draft lifecycle in the UI.

#### 5.0 Proof Artifact(s)

- Screenshot: Clicking "Finalize" on a draft card shows confirmation dialog: "Have you personally confirmed that [Name] has accepted the [Role] position?"
- Screenshot: After finalizing, the slot card changes from draft styling (dashed) to finalized styling (solid) — the member now appears in the regular roster
- Screenshot: Clicking remove on a draft member removes them instantly (no confirmation)
- Screenshot: Clicking remove on a finalized member shows a menu with "Dropped" and "Remove" options
- Manual test: After "Dropped", the `weekend_roster` row has status `'drop'` and the member returns to the community pool. After "Remove", the `weekend_roster` row is deleted and the member returns to the pool.

#### 5.0 Tasks

TBD

---

### [ ] 6.0 Navigation & Homepage Integration

Add the "Roster Builder" nav item under "Current Weekend" (visible only to rectors) and add a homepage banner card for rectors linking to the roster builder.

#### 6.0 Proof Artifact(s)

- Screenshot: Navbar for a rector user shows "Roster Builder" item under "Current Weekend" dropdown with restricted badge
- Screenshot: Navbar for a non-rector user does NOT show "Roster Builder" item
- Screenshot: Homepage shows a prominent banner card for a rector: "You're the Rector for DTTD #[N] [Men's/Women's] Weekend — Build Your Roster →"
- Screenshot: Homepage for a non-rector user does NOT show the banner

#### 6.0 Tasks

TBD
