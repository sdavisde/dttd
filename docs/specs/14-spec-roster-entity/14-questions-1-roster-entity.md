# 14 Questions Round 1 - Roster Entity

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

---

**Context for these questions:** Currently there is no `roster` entity in the database. The "roster" is reconstructed client-side from a hardcoded template (`DEFAULT_ROSTER_TEMPLATE` with 57 slots) + `draft_weekend_roster` rows + `weekend_roster` rows. This spec would introduce a first-class `roster` + `roster_slot` model in the DB.

---

## 1. Roster Creation Trigger

When should the roster entity be created for a weekend?
o90p-

- [ ] (A) Automatically when a weekend group is created (PLANNING status) — both MENS and WOMENS weekends get a roster immediately
- [ ] (B) Automatically when a weekend group is set to ACTIVE — rosters created at activation time
- [ ] (C) Manually by a PWC/admin from the roster builder page (e.g., "Initialize Roster" button)
- [ ] (D) Lazily on first access — when someone opens the roster builder for that weekend, create it if it doesn't exist
- [ ] (E) Other (describe)

## 2. Roster Lifecycle States

The roster entity would have its own status. Which states make sense?

- [ ] (A) `building` → `finalized` (simple two-state: actively editing vs. done)
- [ ] (B) `building` → `finalized` → `locked` (three-state: editing, complete but editable, permanently locked)
- [ ] (C) Tie it to the weekend status directly — roster is editable when weekend is PLANNING/ACTIVE, locked when FINISHED
- [ ] (D) `building` → `review` → `finalized` → `locked` (four-state with a review gate before finalization)
- [ ] (E) Other (describe)

## 3. What Does "Finalized" Mean for the Roster vs. Individual Slots?

Currently individual slots can be independently finalized (draft → finalized). With a roster entity, should there also be a roster-level finalization?

- [ ] (A) Keep individual slot finalization as-is, and roster-level status is just informational (tracks overall progress)
- [ ] (B) Roster-level finalization is the primary action — when the PWC finalizes the roster, ALL draft slots become finalized at once
- [ ] (C) Both — individual slots can be finalized incrementally, AND there's a roster-level "mark complete" that finalizes any remaining drafts
- [ ] (D) Other (describe)

## 4. Relationship Between `roster_slot` and `weekend_roster`

Currently `weekend_roster` holds forms, medical info, payment status, etc. With the new `roster_slot` table:

- [ ] (A) `roster_slot` replaces BOTH `draft_weekend_roster` AND the assignment part of `weekend_roster`. The existing `weekend_roster` table keeps form/medical/payment data and gets a `roster_slot_id` FK to link back.
- [ ] (B) `roster_slot` replaces `draft_weekend_roster` only. When a slot is finalized, a `weekend_roster` row is still created (current behavior), and the slot gets a `weekend_roster_id` FK.
- [ ] (C) `roster_slot` replaces everything — merge form completion, medical, and payment tracking into `roster_slot` or related tables, and eventually sunset `weekend_roster`.
- [ ] (D) Other (describe)

## 5. Template Customization Per Weekend

The default template (57 slots) is currently hardcoded. With roster_slot in the DB:

- [ ] (A) Template is still hardcoded in code — used only as seed data when initializing a roster. PWC can add/remove slots after creation.
- [ ] (B) Template itself should also be stored in DB (a `roster_template` table) so it can be edited by admins without code changes. (This is "Option C" from our earlier conversation.)
- [ ] (C) Template in code, but NO customization — every weekend gets exactly the same 57 slots, no adding/removing.
- [ ] (D) Other (describe)

## 6. What Happens When a Weekend Transitions to FINISHED?

Currently `setActiveWeekendGroup()` triggers `transitionWeekendGroupToFinished()` which converts `weekend_roster` rows into `users_experience` records. With the roster entity:

- [ ] (A) Same behavior, but also update `roster.status` to `locked` automatically
- [ ] (B) Same behavior, plus validate that roster is fully finalized before allowing the transition (guard against accidentally finishing a weekend with draft slots)
- [ ] (C) Same behavior with no additional guards — the roster entity is informational only during transitions
- [ ] (D) Other (describe)

## 7. Slot-Level Metadata

Beyond the core assignment data, what metadata would be useful on individual slots?

- [ ] (A) `notes` field only (e.g., "offered to Jane, declined 3/15")
- [ ] (B) `notes` + `assigned_by` + `assigned_at` (audit trail)
- [ ] (C) Full audit trail: `notes`, `assigned_by`, `assigned_at`, plus a `roster_slot_history` table tracking all assignment changes
- [ ] (D) Keep it minimal for now — just the assignment data, no extra metadata. We can add it later.
- [ ] (E) Other (describe)

## 8. Migration Strategy for Existing Data

There may be active weekends with existing `draft_weekend_roster` and `weekend_roster` data. How should we handle migration?

- [ ] (A) Write a migration that creates roster + roster_slot rows for all existing ACTIVE/PLANNING weekends, populating from current draft/roster data. FINISHED weekends are left as-is.
- [ ] (B) Only apply to new weekends going forward — existing weekends continue using the old tables until they finish.
- [ ] (C) Clean slate — this is early enough that we can wipe draft data and start fresh with the new model.
- [ ] (D) Other (describe)

## 9. Permissions / Who Can Edit the Roster?

Currently the roster builder appears to be accessible to authenticated users. With a formal roster entity:

- [ ] (A) Keep current permissions — any authenticated user can view/edit the roster builder
- [ ] (B) Add role-based access — only PWC, Rector, and FULL_ACCESS users can modify roster slots
- [ ] (C) Tiered access — anyone can view, but only specific roles can assign/finalize/lock
- [ ] (D) Defer permissions to a separate spec — focus this spec on the data model only
- [ ] (E) Other (describe)

## 10. Dashboard / Reporting Aspirations

One benefit of a roster entity is queryable progress. What reporting matters most?

- [ ] (A) Simple progress bar on the weekend admin page (X/Y slots filled, Z required slots remaining)
- [ ] (B) Category-level breakdown visible in admin dashboard
- [ ] (C) Cross-weekend comparison (e.g., "DTTD #11 roster is 80% complete, #10 was 95% at this point in planning")
- [ ] (D) Not a priority right now — the roster builder UI already shows this. DB-level queries are for future use.
- [ ] (E) Other (describe)
