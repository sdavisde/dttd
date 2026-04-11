# 13-spec-roster-builder

## Introduction/Overview

The Roster Builder is a dedicated page for weekend Rectors to assemble their team roster for an upcoming Tres Dias weekend. Currently, roster management happens through the admin interface with no purpose-built workflow for the rector's unique needs. The Roster Builder provides a visual kanban-style interface where rectors can browse the community, evaluate members' experience and eligibility, and assign them to specific CHA role positions — all through a draft-first workflow that keeps assignments private until the rector is ready to finalize them.

## Goals

- Give rectors a single, purpose-built page to build their weekend team roster with rich context about community members' experience, eligibility, and secuela attendance
- Introduce a draft roster workflow so rectors can plan assignments privately before finalizing, with confirmation that team members have personally accepted their position
- Surface eligibility warnings (section head experience, rollo history, rector-ready status) inline so rectors make informed placement decisions
- Provide a standard roster template with the flexibility to add or remove positions as needed
- Make the roster builder easily discoverable for rectors via navbar and homepage

## User Stories

- **As a Rector**, I want to see all community members with their past experience and eligibility status so that I can make informed decisions about who to place in each position.
- **As a Rector**, I want to place people into draft roster slots without it affecting the live roster so that I can plan freely before committing.
- **As a Rector**, I want to finalize each draft assignment individually, confirming that the team member has personally accepted, so that the roster reflects confirmed commitments.
- **As a Rector**, I want to browse and filter the full community (with secuela attendees highlighted) so that I can find the right person for each role even if I don't know everyone by name.
- **As a Rector**, I want to see which positions are filled vs empty at a glance, with experience distribution stats, so that I can track my progress building the roster.
- **As a Rector**, I want to add or remove position slots within each category so that I can customize the roster template for my weekend's specific needs.

## Demoable Units of Work

### Unit 1: Draft Roster Data Model & Service Layer

**Purpose:** Establish the database table and server actions for creating, reading, updating, and finalizing draft roster entries. This is the foundation that all UI work depends on.

**Functional Requirements:**

- The system shall provide a `draft_weekend_roster` table with columns: `id` (uuid PK), `weekend_id` (FK → weekends), `user_id` (FK → users), `cha_role` (text), `rollo` (text, nullable), `created_at` (timestamptz), `created_by` (FK → users, the rector who placed them)
- The system shall provide a server action `addDraftRosterMember(weekendId, userId, chaRole, rollo?)` that inserts a draft row, preventing duplicates (same user + weekend)
- The system shall provide a server action `removeDraftRosterMember(draftId)` that deletes a draft row
- The system shall provide a server action `finalizeDraftRosterMember(draftId)` that creates a `weekend_roster` row (with status `'awaiting_payment'`), creates a `weekend_group_members` row if needed (via existing `upsertGroupMember`), and archives the draft row (either delete it or mark it as finalized with a `finalized_at` timestamp)
- The system shall provide a server action `getDraftRoster(weekendId)` that returns all non-finalized draft entries with joined user data
- The system shall enforce that only the Rector of the specified weekend can call these actions (check that the calling user's `cha_role` is `'Rector'` on the given weekend's `weekend_roster`)
- The system shall apply RLS policies on `draft_weekend_roster` matching the existing `weekend_roster` pattern (authenticated users only, authorization enforced at service layer)

**Proof Artifacts:**

- Test: Server action tests demonstrate draft CRUD operations and finalization flow
- Database: Migration file creates `draft_weekend_roster` table with correct schema and RLS policies

### Unit 2: Community Data Fetching & Eligibility Computation

**Purpose:** Provide the data layer that powers the community browser panel — fetching all users with their experience, computing eligibility flags, and surfacing secuela attendance for the active weekend group.

**Functional Requirements:**

- The system shall provide a server action `getRosterBuilderCommunityData(weekendId)` that returns all users with: name, email, phone, church, gender, experience records (from `users_experience`), secuela attendance (from `weekend_group_members` for the active group), and current roster assignment status (from `weekend_roster` + `draft_weekend_roster`)
- The system shall compute for each community member: experience level (via existing `calculateExperienceLevel`), rector-ready status (via existing `calculateRectorReadyStatus`), `hasBeenSectionHead` (derived: any past role in `TEAM_HEAD_ROLES`), and `hasGivenRollo` (derived: any `users_experience` row with non-null `rollo`)
- The system shall define a `SECTION_HEAD_ELIGIBLE_ROLES` whitelist using the existing `TEAM_HEAD_ROLES` constant from `lib/users/experience/calculations.ts`
- The system shall compute Head/Assistant Head eligibility as: `hasBeenSectionHead AND hasGivenRollo`
- The system shall compute Rover eligibility as: `rectorReadyStatus.isReady` (from `calculateRectorReadyStatus`)
- The system shall implement eligibility checking in an extendable fashion (e.g., a registry or map of `CHARole → eligibilityCheck(member)`) so new eligibility rules can be added for other roles in the future

**Proof Artifacts:**

- Test: Eligibility computation tests verify correct derivation of section head, rollo, and rector-ready flags from experience data
- CLI/Test: `getRosterBuilderCommunityData` returns correctly shaped data with all computed fields

### Unit 3: Roster Builder Page — Kanban Board UI

**Purpose:** Deliver the core visual interface: the horizontal kanban board showing role categories as columns with filled/empty slot cards, the stats header, and the assignment popover for placing community members into slots.

**Functional Requirements:**

- The page shall be accessible at `/roster-builder` and require authentication; the system shall redirect non-authenticated users to `/login`
- The page shall verify the logged-in user is the Rector of an active weekend; if not, the system shall show an appropriate error/redirect
- The page shall display the weekend title (e.g., "DTTD #45 Men's Roster") and show only the weekend(s) where the user is assigned as Rector
- The page shall display a stats header row with: positions filled (with progress bar), required positions remaining, secuela attendance percentage of assigned members, and experience distribution (Veteran/Experienced/Served/New horizontal bar)
- The page shall display a horizontally scrollable kanban board with one column per role category (Leadership, Rollistas, Spiritual, Prayer & Chapel, Music, Tech, Palanca, Table & Dorm, Dining & Food, Support)
- Each column shall display a colored header with category name and "X/Y filled" counter
- Filled slots shall display: member name (text-base font), role + rollo, experience level badge, secuela/rector-ready indicators, and last 2 past roles; draft slots shall be visually distinct from finalized slots (e.g., dashed border vs solid)
- Empty slots shall display role name, rollo (if applicable), "Required" or "Optional" label, and a dashed border; clicking an empty slot shall open an assignment popover
- The assignment popover shall use a Command/Combobox pattern with search, listing available (unassigned) members sorted by: secuela attendees first, then by experience count descending; each item shall show name, church, experience level, weekends served, secuela badge, and past roles
- The assignment popover shall show inline eligibility warnings for roles with requirements (e.g., "Not eligible — needs section head experience + rollo" for Head/Asst Head slots, "Not eligible — not rector ready" for Rover slots)
- The toolbar shall include: a search input filtering columns/slots by role or member name, filter toggles (All / Filled / Empty), and a "Browse Community" button to open the community drawer
- Each column shall have an "Add Position" button at the bottom that opens a dropdown to select a CHA role (and optionally a rollo for Table Leader), creating a new empty slot in that category
- Slots added by the rector shall be removable (delete the empty slot) to customize the template

**Proof Artifacts:**

- Screenshot: Roster builder page loads with kanban board showing category columns, filled/empty slots, and stats header
- Screenshot: Assignment popover shows filtered community members with eligibility warnings
- Screenshot: Draft vs finalized slots are visually distinct

### Unit 4: Community Drawer Panel

**Purpose:** Deliver the slide-out Sheet panel for browsing and filtering the full community, with rich detail cards showing experience history and eligibility, and the ability to assign members to specific slots from the panel.

**Functional Requirements:**

- The community drawer shall open as a right-side Sheet (width `sm:max-w-lg`) triggered by the "Browse Community" button in the toolbar
- The drawer shall display a header with "Community Members" title and count of unassigned members
- The drawer shall provide filter controls: search by name or church, toggle pills for "Attends Secuela" / "Has Given Rollo" / "Section Head Experience" / "Rector Ready", and an experience level dropdown (All / Veteran / Experienced / Served / New)
- A "Clear filters" button shall appear when any filter is active, and a "Showing X of Y" counter shall update live
- Each community member card shall display: name (text-base font-semibold), church, weekends served count, experience level badge, indicator badges (Secuela, Rector Ready, Section Head, Given Rollo), eligibility summary line (e.g., "Eligible for: Head/Asst Head, Rover" or "Eligible for: General positions"), and expandable experience history showing past weekends with role and rollo
- Each card shall have an "Assign to..." button that opens a popover listing all empty slots grouped by category, with eligibility warnings inline for roles the member doesn't qualify for
- Members already assigned (draft or finalized) shall appear grayed out with their current assignment shown

**Proof Artifacts:**

- Screenshot: Community drawer open with filters applied, showing member cards with experience details
- Screenshot: "Assign to..." popover showing available slots grouped by category

### Unit 5: Draft Finalization & Removal Flows

**Purpose:** Implement the interactive flows for finalizing draft assignments (with confirmation messaging) and removing/dropping roster members.

**Functional Requirements:**

- Draft slot cards shall display a "Finalize" action button
- Clicking "Finalize" shall show a confirmation dialog with messaging: "Have you personally confirmed that [Name] has accepted the [Role] position?" with "Yes, Finalize" and "Cancel" buttons
- Upon finalization, the system shall call `finalizeDraftRosterMember`, creating the `weekend_roster` row and archiving the draft; the UI shall update the slot to show as finalized (solid border, full styling)
- For draft (non-finalized) members, a "Remove" action shall delete the draft row without confirmation
- For finalized members, clicking remove shall show a menu with two options: "Dropped" (sets `weekend_roster.status` to `'drop'`, preserving history) and "Remove" (hard-deletes the `weekend_roster` row)
- Dropped members shall no longer appear in the slot but shall remain in the database for historical tracking
- Removed members shall return to the available community pool immediately

**Proof Artifacts:**

- Screenshot: Finalization confirmation dialog with messaging about personal confirmation
- Screenshot: Finalized member's remove menu showing "Dropped" and "Remove" options
- Test: Finalization flow creates correct `weekend_roster` and `weekend_group_members` rows

### Unit 6: Navigation & Homepage Integration

**Purpose:** Make the roster builder discoverable for rectors through the navbar and homepage.

**Functional Requirements:**

- The system shall add a "Roster Builder" nav item under the "Current Weekend" dropdown, visible only to users who are the Rector on the active weekend's `weekend_roster`
- The nav item shall use the `clipboard-list` icon and include a `'restricted'` badge
- The system shall require team membership (`requiresTeamMembership: true`) for the nav item
- The homepage shall display a prominent card/banner for rectors at the top: "You're the Rector for DTTD #[N] [Men's/Women's] Weekend — Build Your Roster" with a link to `/roster-builder`
- The homepage banner shall only appear when the user is the Rector of an active weekend

**Proof Artifacts:**

- Screenshot: Navbar showing "Roster Builder" item under "Current Weekend" for a rector user
- Screenshot: Homepage banner card visible for a rector user

## Non-Goals (Out of Scope)

1. **Notifications/emails to team members**: Draft assignments are private to the rector. Notifications when finalized may be added in a future iteration.
2. **Drag-and-drop reordering**: The kanban board uses click-to-assign, not drag-and-drop between columns.
3. **Multi-weekend editing**: The roster builder shows one weekend at a time (the one the rector is assigned to). Building rosters for both Men's and Women's weekends simultaneously is not in scope.
4. **Bulk operations**: No "finalize all" or "publish roster" bulk action. Each assignment is finalized individually.
5. **Mobile-optimized layout**: The kanban board is a desktop-first experience. Basic mobile usability via horizontal scroll is acceptable but a mobile-specific card layout is not in scope for this iteration.
6. **PDF/print export**: Not in scope for this iteration.
7. **Admin override**: Admins cannot access the roster builder; they continue using the existing admin roster management interface.

## Design Considerations

The approved design is **"Kanban + Community Drawer"** (Design A from v2 prototypes), located at `app/(public)/roster-builder/designs-v2/design-a-kanban-drawer.tsx`. This prototype uses mock data and should be adapted to use real data.

Key design requirements:

- **Larger fonts**: `text-base` (16px) minimum for names and important text. `text-sm` (14px) for secondary info. `text-xs` (12px) only for badges and tertiary labels.
- **Category colors**: Leadership (amber), Rollistas (blue), Spiritual (purple), Prayer & Chapel (pink), Music (green), Tech (slate), Palanca (rose), Table & Dorm (orange), Dining & Food (yellow), Support (teal)
- **Draft vs finalized visual distinction**: Draft slots should have dashed borders or a distinct visual treatment. Finalized slots should look solid and "committed."
- **Stats header**: 4 stat cards — positions filled, required remaining, secuela %, experience distribution
- **Dark mode**: All color choices must include `dark:` variants

## Repository Standards

- Follow existing server action pattern: `actions.ts` (controller with auth) → `service.ts` (business logic) → `repository.ts` (data access)
- Use `Result<Error, T>` return types for all server actions
- Use `toastError()` for user-facing error messages (never raw server errors)
- Use `isNil()` from lodash for null/undefined checks
- Use existing `authorizedAction()` pattern for permission-gated server actions
- Supabase migrations in `supabase/migrations/` with timestamp-prefixed filenames
- Components follow shadcn/ui patterns; all UI from `@/components/ui/`
- Client components marked with `'use client'`; server components for data fetching
- Use `yarn lint` and `npx tsc --noEmit` to verify changes

## Technical Considerations

- **Existing infrastructure to reuse**: `calculateRectorReadyStatus`, `calculateExperienceLevel`, `countDistinctWeekends`, `TEAM_HEAD_ROLES` from `lib/users/experience/calculations.ts`; `addUserToWeekendRoster` and `GroupMemberRepository.upsertGroupMember` from `services/weekend/`; `getMasterRoster` query patterns from `services/master-roster/`
- **Draft table design**: `draft_weekend_roster` should mirror the key columns of `weekend_roster` (weekend_id, user_id, cha_role, rollo) plus `created_by` for audit trail and optionally `finalized_at` for archive tracking. Keep it simple — no status column needed since drafts are either present (active) or have a `finalized_at` (archived).
- **Roster template**: The default slot template should be defined as a TypeScript constant (array of `{ category, role, rollo?, required }` objects) that can be easily edited. It is NOT stored in the database — it's a UI-side default that the rector can customize per-session. Customizations (added/removed slots) are ephemeral unless backed by a draft or real roster row.
- **Performance**: The community data query joins users, users_experience, weekend_group_members, weekend_roster, and draft_weekend_roster. Consider using a single optimized query or parallel queries to keep load time under 2 seconds.
- **Eligibility system**: Implement eligibility checks as a map of `CHARole → (member) => { eligible: boolean, reason?: string }` so new rules can be added without modifying existing code. Only Head/Asst Head and Rover have rules initially.
- **Rector detection for navbar/homepage**: Query must check `weekend_roster` for the active weekend where `cha_role = 'Rector'` and `user_id` matches the logged-in user. This needs to be efficient since it runs on every page load (via navbar server component).

## Security Considerations

- **Authorization**: All draft roster mutations must verify the calling user is the Rector of the target weekend. Use service-layer checks (not just RLS) since RLS policies are permissive for all authenticated users.
- **Data access**: The community data endpoint exposes user names, emails, phones, and churches. This is acceptable since the rector already has `READ_USER_EXPERIENCE` and contact permissions via their CHA role.
- **Draft privacy**: Draft roster data should only be readable by the rector who created it. RLS policy on `draft_weekend_roster` should filter by `created_by = auth.uid()` for SELECT, or service-layer enforcement.

## Success Metrics

1. **Rector can build a full roster draft** from the roster builder page without needing the admin interface
2. **Eligibility warnings** correctly prevent or warn about ineligible placements for Head/Asst Head and Rover roles
3. **Finalization flow** correctly creates `weekend_roster` and `weekend_group_members` rows matching the existing admin flow behavior
4. **Page load time** under 2 seconds for community data with 100+ users
5. **Zero regressions** to the existing roster page, admin roster management, or team forms workflow

## Open Questions

1. Should the roster template (default slots per category) be persisted per-weekend so the rector's customizations survive page refreshes? Or is ephemeral (mock-data-style constant) acceptable for v1?
2. Should there be a way for the rector to add notes/comments per draft assignment (e.g., "Prefers morning chapel shift")?
3. When a finalized member is "Dropped," should the rector be prompted for a reason?
