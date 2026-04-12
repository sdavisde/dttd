# 14-spec-roster-entity

## Introduction/Overview

Introduce a first-class `roster` entity in the database to represent the collection of positions for a weekend. Today, the "roster" is an ephemeral concept — reconstructed client-side from a hardcoded 57-slot template combined with `draft_weekend_roster` and `weekend_roster` rows. This makes it impossible to query roster progress from the DB, customize templates per weekend, or track slot-level metadata.

This spec adds a `roster` table (one per weekend) and a `roster_slot` table (one per position, filled or empty), creating a persistent, queryable representation of the roster that integrates with the weekend lifecycle.

## Goals

- Create a persistent roster entity that exists in the database, tied to a weekend
- Store every position (slot) in the DB — including empty ones — so progress is queryable server-side
- Unify the current split between `draft_weekend_roster` (drafts) and assignment tracking into a single `roster_slot` model
- Enable per-weekend template customization (add/remove slots without code changes)
- Integrate roster lifecycle with the existing weekend status transitions (PLANNING → ACTIVE → FINISHED)

## User Stories

- **As a PWC**, I want the roster to be a real thing in the system so that I can see how many positions are left to fill without opening the roster builder UI.
- **As a PWC**, I want to customize the roster for a specific weekend (e.g., add an extra Tech slot) without needing a code change.
- **As an admin**, I want to see roster completion progress on the weekend admin page so I can track planning status at a glance.
- **As a PWC**, I want notes on individual slots (e.g., "offered to Jane, she declined") so I can track outreach during roster building.
- **As the system**, when a weekend transitions to FINISHED, the roster should be locked to prevent further edits.

## Demoable Units of Work

### Unit 1: Database Schema — `roster` and `roster_slot` Tables

**Purpose:** Establish the data model that everything else builds on.

**Functional Requirements:**

- The system shall have a `roster` table with: `id`, `weekend_id` (unique FK), `status`, `created_by`, `created_at`, `finalized_at`, `notes`
- The system shall have a `roster_slot` table with: `id`, `roster_id` (FK), `category`, `cha_role`, `rollo` (nullable), `required`, `sort_order`, `assigned_user_id` (nullable FK), `assignment_status` ('empty' | 'draft' | 'finalized'), `assigned_at`, `assigned_by`, `notes`
- The system shall enforce one roster per weekend via unique constraint on `weekend_id`
- The system shall cascade delete roster_slots when a roster is deleted

**Proof Artifacts:**

- Migration file applies cleanly against local Supabase
- `yarn db:generate` produces updated types including both new tables

### Unit 2: Roster Initialization — Seeding Slots from Template

**Purpose:** When a roster is created, populate it with the default 57 slots from the existing template.

**Functional Requirements:**

- The system shall create a roster and seed all `roster_slot` rows from `DEFAULT_ROSTER_TEMPLATE` when initialization is triggered
- Each slot shall have correct `category`, `cha_role`, `rollo`, `required`, and `sort_order` values matching the current template
- The system shall set all slots to `assignment_status = 'empty'` on creation

**Proof Artifacts:**

- After initialization, querying `roster_slot` returns 57 rows with correct category/role data
- The roster builder UI renders identically to current behavior (slots in same order, same categories)

### Unit 3: Service Layer Migration — Read/Write Through `roster_slot`

**Purpose:** Replace the current `draft_weekend_roster` insert/delete pattern with updates to `roster_slot` rows.

**Functional Requirements:**

- The system shall assign a member to a slot by updating `assigned_user_id` and `assignment_status` on an existing `roster_slot` row (instead of inserting into `draft_weekend_roster`)
- The system shall remove an assignment by setting a slot back to `empty` (instead of deleting from `draft_weekend_roster`)
- The system shall finalize a slot by updating `assignment_status` to `'finalized'` and creating the corresponding `weekend_roster` row (preserving the existing form/medical/payment tracking)
- The `weekend_roster` table shall gain a `roster_slot_id` FK to link finalized slots back to their position
- `buildInitialCategories()` shall be replaced by a server-side query that returns `RoleCategory[]` directly from `roster` + `roster_slot` data

**Proof Artifacts:**

- Assigning, removing, and finalizing members in the roster builder UI works end-to-end
- The `draft_weekend_roster` table is no longer written to by any code path

### Unit 4: Weekend Lifecycle Integration

**Purpose:** Wire roster status into the existing weekend status transitions.

**Functional Requirements:**

- When a weekend transitions to FINISHED, the system shall update `roster.status` to `locked`
- The roster builder UI shall prevent edits when roster status is `locked`
- The system shall support adding/removing slots from an active roster (template customization per weekend)

**Proof Artifacts:**

- Setting a weekend to ACTIVE/FINISHED correctly updates roster status
- Attempting to modify a locked roster is rejected by the service layer

## Non-Goals (Out of Scope)

1. **Reusable roster templates in the DB** — the default template stays in code. A `roster_template` table for admin-editable templates is a future enhancement.
2. **Full audit history table** — slot-level `assigned_by`/`assigned_at` fields provide basic tracking, but a `roster_slot_history` table for every change is deferred.
3. **Permissions overhaul** — this spec focuses on the data model. Role-based access control for roster editing is a separate concern.
4. **Sunsetting `weekend_roster`** — that table retains form completion, medical info, and payment data. It stays, linked via `roster_slot_id`.
5. **Cross-weekend reporting/comparison** — the data model enables it, but building dashboard UI for it is out of scope.

## Design Considerations

No new pages or major UI changes. The roster builder continues to function as-is — the primary change is that it reads from/writes to `roster_slot` instead of `draft_weekend_roster` + client-side template reconstruction. Minor additions:

- Progress indicator on the weekend admin page (slot count from DB)
- "Locked" state in roster builder when weekend is FINISHED

## Repository Standards

- Server actions return `Result<Error, T>` types
- Use `toastError()` for user-facing errors
- Supabase migrations in `supabase/migrations/`
- Run `yarn db:generate` after schema changes
- Service layer in `services/roster-builder/`
- Follow existing repository → service → action → UI layering

## Technical Considerations

- `roster_slot` replaces `draft_weekend_roster` for assignment tracking. The `draft_weekend_roster` table can be dropped once migration is complete and verified.
- `weekend_roster` stays — it holds form timestamps, medical data, payment links. It gains a `roster_slot_id` FK.
- The finalization flow (slot finalized → `weekend_roster` row created → `weekend_group_members` upserted) remains the same, just triggered from `roster_slot` instead of `draft_weekend_roster`.
- `buildInitialCategories()` and `DEFAULT_ROSTER_TEMPLATE` usage shifts from runtime reconstruction to one-time seed data at roster creation.
- Bulk insert of 57 `roster_slot` rows on initialization — use a single Supabase `.insert()` call with an array.

## Security Considerations

- RLS policies on `roster` and `roster_slot` should match current pattern (authenticated users can read/write)
- Medical data stays in `weekend_roster`, not exposed through `roster_slot`

## Success Metrics

1. **Roster progress queryable from DB** — `SELECT count(*) FROM roster_slot WHERE assignment_status = 'empty'` returns accurate unfilled count
2. **Zero behavioral regression** — roster builder UI works identically from the user's perspective
3. **`draft_weekend_roster` fully replaced** — no code reads from or writes to it after migration
4. **Template customization works** — PWC can add/remove slots for a specific weekend without code changes

## Open Questions

> These need to be answered before implementation begins. See `14-questions-1-roster-entity.md` for the full question set with options.

1. **Roster creation trigger** — auto on weekend creation, auto on activation, manual button, or lazy on first access?
2. **Roster lifecycle states** — simple `building`/`finalized`, three-state with `locked`, or tied directly to weekend status?
3. **Roster-level vs. slot-level finalization** — is there a "finalize entire roster" action, or only individual slot finalization?
4. **Slot-level metadata scope** — just `notes`, or full audit trail (`assigned_by`, `assigned_at`), or defer metadata entirely?
5. **Migration strategy** — backfill existing active weekends, forward-only for new weekends, or clean slate?
6. **Weekend FINISHED transition guards** — should the system warn/block if roster has unfilled required slots when finishing?
