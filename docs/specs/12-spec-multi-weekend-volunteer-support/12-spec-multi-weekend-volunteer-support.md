# 12-spec-multi-weekend-volunteer-support

## Introduction / Overview

Some volunteers, most commonly spiritual directors, are assigned to serve on both the men's and women's weekends of the same weekend group. The current system assumes each volunteer serves on exactly one weekend. That assumption leaks into user loading, team forms, payment, and homepage TODO logic, so one of the assignments gets ignored.

This spec changes the model from "shared state duplicated onto roster rows" to "shared state belongs to the volunteer's participation in a weekend group." Forms and team fee payment are completed once per weekend group, while weekend-specific assignments remain on `weekend_roster`.

## Goals

- Allow a volunteer to be assigned to both weekends of a group without the app silently ignoring one assignment
- Ensure forms and team fee payment are completed once per weekend group, not once per weekend assignment
- Move volunteer health and emergency contact data into a reusable profile with tighter access control than the current `users` table policies provide
- Create a proper `weekend_groups` table so group metadata has a real home instead of a bare UUID reference
- Normalize form completion tracking into a separate table so required forms are defined in config, not in schema columns
- Keep the single-weekend volunteer experience effectively unchanged while fixing the multi-weekend case

## User Stories

**As a spiritual director** serving both the men's and women's weekends of a group, I want my completed forms and paid team fee to count for the whole group so that I do not have to repeat the same work twice.

**As a team member** returning to serve a new weekend group, I want my medical and emergency contact information to be pre-filled from my profile so that I do not have to re-enter it from scratch.

**As a weekend coordinator** (admin), I want each weekend group to have a number and a derived label such as "Group 47 — Men's" so that the app consistently identifies weekends throughout the system.

**As a developer** adding or removing a required form in the future, I want to update one config file and the progress logic without adding or dropping database columns.

## Demoable Units of Work

---

### Unit 1: Shared Group Schema Foundation

**Purpose:** Introduce the tables required for group-scoped volunteer participation, normalized team form completion, and secured medical-profile reuse. This unit is additive and data-preserving.

**Functional Requirements:**

- The system shall create a `weekend_groups` table with columns: `id` (uuid, PK), `number` (integer, not null), `created_at`.
- The system shall migrate the `number` value from each existing `weekends` row into its corresponding `weekend_groups` row, creating one group row per unique `group_id` currently on `weekends`.
- The system shall add a foreign key on `weekends.group_id` -> `weekend_groups.id`.
- The system shall remove the `number` column from the `weekends` table after migration.
- The system shall create a `weekend_group_members` table with columns: `id` (uuid, PK), `group_id` (uuid, FK -> `weekend_groups.id`, ON DELETE CASCADE), `user_id` (uuid, FK -> `users.id`, ON DELETE CASCADE), `created_at`, plus a unique constraint on `(group_id, user_id)`.
- The system shall backfill `weekend_group_members` so each distinct `(group_id, user_id)` represented by existing `weekend_roster` rows gets exactly one group-member row.
- The system shall create a `team_form_completions` table with columns: `id` (uuid, PK), `weekend_group_member_id` (uuid, FK -> `weekend_group_members.id`, ON DELETE CASCADE), `form_type` (text), `completed_at` (timestamptz), plus a unique constraint on `(weekend_group_member_id, form_type)`.
- The system shall migrate all existing non-null `completed_*_at` timestamps from `weekend_roster` into `team_form_completions`, grouped by `weekend_group_member_id`, preserving the most recent completion timestamp per form within the same group.
- The system shall drop the five `completed_*_at` columns from `weekend_roster` after migration.
- The system shall create a `user_medical_profiles` table with columns: `user_id` (uuid, PK/FK -> `users.id`, ON DELETE CASCADE), `emergency_contact_name` (text), `emergency_contact_phone` (text), `medical_conditions` (text), `created_at`, `updated_at`.
- The system shall migrate `emergency_contact_name`, `emergency_contact_phone`, and `medical_conditions` from `weekend_roster` into `user_medical_profiles`, taking the most recent non-null value per user.
- The system shall drop `emergency_contact_name`, `emergency_contact_phone`, and `medical_conditions` from `weekend_roster` after migration.
- The system shall preserve `special_needs` on `weekend_roster` because it remains assignment-specific data.
- The system shall update `payment_transaction.target_type` to allow `weekend_group_member` and shall add a unique constraint or unique partial index on `payment_intent_id` where it is non-null so one checkout maps to one payment record.

**Proof Artifacts:**

- Migration runs cleanly: `yarn db:reset` completes without errors.
- Database inspection: `weekend_groups` exists and contains one row per former `group_id`, with `number` populated.
- Database inspection: `weekend_group_members` exists and contains one row per distinct user/group pair.
- Database inspection: `team_form_completions` exists and contains migrated rows keyed to `weekend_group_member_id`.
- Database inspection: `user_medical_profiles` exists and is populated for users with prior medical data.
- Database inspection: `weekend_roster` no longer has the five `completed_*_at` columns or the three medical columns.

---

### Unit 2: Service, Payment, and Form Logic Updates

**Purpose:** Update all server-side code to use the new shared group membership model. After this unit, single-weekend volunteers work on the new model without visible regression.

**Functional Requirements:**

- The system shall update `weekend_roster` repository and service queries to stop reading or writing the migrated form and medical columns.
- The system shall define required team forms in a single config source used by progress calculation and UI. `team_form_completions.form_type` shall remain free-text validated in the app layer, not a database enum/check list.
- The system shall update all team form completion actions to insert or upsert rows in `team_form_completions` for a given `weekend_group_member_id`.
- The system shall update `getTeamFormsProgress` and `hasCompletedAllTeamForms` to query `team_form_completions` by `weekend_group_member_id`, building completion state from the configured required forms.
- The system shall update `submitReleaseOfClaim` so the shared form completion is recorded on the `weekend_group_member`, while the submitted `special_needs` text is copied onto each active `weekend_roster` assignment in that same active group.
- The system shall update the medical-info action to write to `user_medical_profiles` keyed by `user_id`, not to `weekend_roster`.
- The system shall update the Info Sheet page to pre-fill emergency contact and medical fields from `user_medical_profiles`.
- The system shall update `hasTeamPayment` and all team-fee payment reads to use `weekend_group_member` as the payment target.
- The system shall update the team-fee checkout page and Stripe metadata contract so `group_member_id` is the source of truth for team payments. `weekend_id` may still be included for display or notifications, but the webhook shall not need it to determine the payment target.
- The system shall update webhook handlers and manual-payment flows so a team fee creates exactly one `payment_transaction` row targeted at the `weekend_group_member`.
- The system shall update the weekend service to derive a display label for a weekend from group number and type, replacing uses of `weekend.number` as a display string.
- The system shall update the admin weekend creation and edit flows to write `number` to `weekend_groups` rather than `weekends`.
- The system shall keep `genderMatchesWeekend()` only for candidate-related filtering and remove any uses that gate volunteer assignment, volunteer form access, or volunteer payment access.
- The system shall update generated TypeScript types (`database.types.ts`) to reflect the new schema via `yarn db:generate`.

**Proof Artifacts:**

- Screenshot: A team member completes the Statement of Belief form; `team_form_completions` shows one row keyed to their `weekend_group_member`; the stepper advances.
- Screenshot: The Info Sheet page shows pre-filled emergency contact data loaded from `user_medical_profiles`.
- Screenshot: The team-fee flow creates one `payment_transaction` targeted at `weekend_group_member`.
- Screenshot: An admin weekend page shows labels like "Group 47 — Men's" derived from group number plus weekend type.
- Build: `yarn build` completes with no TypeScript errors.

---

### Unit 3: Multi-Weekend Volunteer Experience

**Purpose:** Support volunteers assigned to both weekends in the active group. After this unit, a spiritual director on both weekends sees one shared set of forms, one team-fee state, and one homepage TODO experience.

**Functional Requirements:**

- The system shall keep `User.teamMemberInfo` singular for the active weekend group, but change its shape to a group-scoped object that includes:
  - `groupMemberId`
  - `groupId`
  - `assignments: TeamAssignment[]` containing one item per active `weekend_roster` assignment in the active group
- The system shall update `user-service.ts` to collect all active roster records in the active weekend group instead of using `.find()` on `weekend_roster`.
- The system shall update `TeamMemberUser` to require the new group-scoped `teamMemberInfo`.
- The system shall update all consumers of `user.teamMemberInfo` to use shared state from `groupMemberId` and assignment-specific state from `assignments[]`.
- The system shall update the team forms layout and pages to use the user's shared completion state for the active group rather than a specific roster ID.
- The system shall update the homepage TODO items so a volunteer on both weekends sees a single "Complete team forms" TODO and a single "Pay team fees" TODO, both backed by the shared `weekend_group_member`.
- The system shall update the team-fee page so it no longer requires a `weekend_id` query param when the user already has an active `weekend_group_member`.
- The system shall update `isUserRectorOnUpcomingWeekend()` to check the user's actual roster assignments in the active group rather than using `user.gender` to infer a weekend.
- The system shall keep navbar team-membership checks based on the presence of `teamMemberInfo`, not on gender-derived weekend matching.
- The system shall update admin roster views for both the men's and women's weekends to show shared forms/payment status via the linked `weekend_group_member`.

**Proof Artifacts:**

- Demo flow: A test user is added to both the men's and women's `weekend_roster` rows for the same group. They log in, complete all team forms, and pay the team fee once. The database shows one `weekend_group_member`, one shared set of `team_form_completions`, and one team-fee `payment_transaction`, while both weekend roster pages reflect that shared state.
- Screenshot: The homepage TODO list shows a single "Complete team forms" item and a single "Pay team fees" item for the cross-weekend user.
- Screenshot: A single-weekend volunteer's experience is unchanged from the user's perspective.
- Build: `yarn build` completes with no TypeScript errors after all consumer updates.

---

## Non-Goals (Out of Scope)

1. **`users_experience` table unification**: The historical service record table is not touched in this spec.
2. **Roster page tab defaulting**: The public roster page may still default tabs by gender for now.
3. **Direct admin CRUD UI for `weekend_groups` or `weekend_group_members`**: Existing admin flows are updated, but no dedicated management page is added.
4. **Role-specific form requirements**: All volunteers still complete the same configured set of forms.
5. **Prayer wheel URL logic**: Settings logic that uses `user.gender` remains out of scope.
6. **Per-weekend self-service special-needs editing for cross-weekend volunteers**: The shared Release of Claim flow copies one `special_needs` value to each active assignment in the group. Divergent per-weekend edits are a future UX improvement.

## Design Considerations

No weekend selector or duplicated form/payment UI is introduced. Team forms and team-fee payment are group-scoped by design, so the existing pages remain visually familiar while their data source changes.

The Info Sheet continues to look the same, but its medical and emergency-contact values come from `user_medical_profiles`. Updating those fields updates the reusable profile, not a single roster row.

Weekend labels are always derived from `weekend_groups.number` and weekend type. Manual custom labels are out of scope for this spec.

## Repository Standards

- Server actions follow the pattern in `actions/`: `'use server'` at top, return `Result<string, T>`, validate inputs with `isNil`/`isEmpty` guards before touching the database.
- Service layer follows the layered architecture defined in `services/CLAUDE.md`: `repository.ts` (queries only) -> `*-service.ts` (business logic) -> `actions.ts` (auth/RBAC, public export).
- All database operations use types generated from `database.types.ts`. Run `yarn db:generate` after any schema change.
- TypeScript types for domain objects live in `lib/` subdirectories (`lib/weekend/types.ts`, `lib/users/types.ts`).
- Use `Results.unwrapOr`, `Results.map`, `Results.andThen` from `lib/results` for result composition rather than manual branching.
- Migrations go in `supabase/migrations/` with timestamp-prefixed filenames. Each migration should be focused and independently reviewable. Run `yarn db:reset` to validate the full migration chain locally.
- Commit messages follow conventional commits (`feat:`, `fix:`, `chore:`) with body lines <= 100 characters.

## Technical Considerations

- **Schema changes are four independent migrations**: (1) `weekend_groups` plus `weekends.number` migration, (2) `weekend_group_members` plus backfill, (3) `team_form_completions` plus form migration and column drop, (4) `user_medical_profiles` plus medical migration, RLS, and column drop.
- **Shared state is group-scoped, not roster-scoped**: Forms and team-fee payment belong to `weekend_group_member`. Weekend-specific assignment data remains on `weekend_roster`.
- **Do not duplicate payment rows across roster records**: One successful team-fee checkout should create one `payment_transaction` row. Webhook backfill and lookup logic remain simple because `payment_intent_id` maps to one payment record.
- **Stripe contract change is required**: Team-fee checkout metadata and webhook handling must be updated together so `group_member_id` is the canonical payment target.
- **`teamMemberInfo` is a shape change, not just a nullability change**: Existing code that expects `user.teamMemberInfo.id` as a roster ID must be updated to use `groupMemberId` or `assignments[]` as appropriate.
- **One active weekend group is assumed**: The current app model assumes only one weekend group is active at a time. This spec continues that invariant and relies on it when building the logged-in user's group-scoped team-member context.
- **Special-needs edge case remains limited**: Cross-weekend volunteers self-serve one `special_needs` value through the shared Release of Claim flow. Supporting different per-weekend values would require additional UI and is deferred.
- **Medical data migration risk**: If a user has conflicting medical/emergency values across old roster rows, the most recent non-null value wins. That edge case is acceptable for this migration.

## Security Considerations

- Medical conditions and emergency contact data are sensitive personal data. They shall not be added to the current `users` table because that table's existing policies are too broad for this data.
- `user_medical_profiles` shall have explicit RLS so users can read and update only their own profile, while admin/service-role paths retain the access they need for roster and support workflows.
- No new end-user authentication flow is introduced. Existing team-membership and permission checks continue to apply after being updated to the new data model.

## Success Metrics

1. **No data loss**: Existing team form completion timestamps and medical data are present in their new tables after migration.
2. **Cross-weekend volunteer correctness**: A user with two active roster rows in the same group sees one shared forms state, one shared payment state, and one set of homepage TODOs.
3. **Single payment semantics**: A cross-weekend volunteer pays the team fee once, producing one payment record targeted at their `weekend_group_member`.
4. **Single-weekend volunteer unchanged**: A user with one active roster row has an effectively unchanged experience.
5. **Build passes**: `yarn build` completes with zero TypeScript errors after all consumer updates.
6. **Migration chain valid**: `yarn db:reset` runs cleanly end-to-end on a fresh database.

## Open Questions

1. Should admin roster tools eventually expose per-weekend overrides for `special_needs` after the shared Release of Claim flow writes the same value to all assignments in the active group?
