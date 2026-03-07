# 12-tasks-multi-weekend-volunteer-support

## Relevant Files

### New Files

- `supabase/migrations/YYYYMMDDHHMMSS_weekend_groups.sql` — Migration 1: create `weekend_groups`, migrate `number`, add FK on `weekends.group_id`, drop `weekends.number`
- `supabase/migrations/YYYYMMDDHHMMSS_weekend_group_members.sql` — Migration 2: create `weekend_group_members`, backfill from `weekend_roster`
- `supabase/migrations/YYYYMMDDHHMMSS_team_form_completions.sql` — Migration 3: create `team_form_completions`, migrate `completed_*_at` data, drop migrated columns from `weekend_roster`
- `supabase/migrations/YYYYMMDDHHMMSS_user_medical_profiles.sql` — Migration 4: create `user_medical_profiles` with RLS, migrate medical data, drop medical columns from `weekend_roster`
- `supabase/migrations/YYYYMMDDHHMMSS_payment_intent_unique_index.sql` — Migration 5: add unique partial index on `payment_transaction(payment_intent_id)` where non-null
- `services/weekend-group-member/repository.ts` — DB queries for `weekend_group_members` and `team_form_completions`
- `services/weekend-group-member/weekend-group-member-service.ts` — Business logic for group-member lookup, form completion, payment check
- `services/weekend-group-member/types.ts` — Raw and normalized types
- `services/weekend-group-member/index.ts` — Public re-exports
- `lib/weekend/team/required-forms.config.ts` — Config array of required `form_type` string keys (single source of truth)

### Modified Files

- `database.types.ts` — Regenerated after each schema migration via `yarn db:generate`
- `services/identity/user/repository.ts` — Update `JoinWeekendRosterOnUserId` to also join `weekend_group_members`; add group-member query
- `services/identity/user/user-service.ts` — `normalizeUser` now builds group-scoped `teamMemberInfo` with `assignments[]`
- `services/identity/user/types.ts` — Update `RawUser` shape to include group-member join data
- `lib/weekend/types.ts` — Reshape `TeamMemberInfo` to `{ groupMemberId, groupId, assignments: TeamAssignment[] }`
- `lib/users/types.ts` — Update `TeamMemberUser` to use new `TeamMemberInfo`
- `lib/weekend/team/todos.config.ts` — Use `groupMemberId` for form and payment checks
- `lib/weekend/team/todos.actions.ts` — Remove `weekend_id` dependency for URL building; use `assignments[0]` for weekend
- `lib/weekend/team/todos.types.ts` — Update `TodoCompletionContext` comment if needed
- `actions/team-forms.ts` — All form-signing actions write to `team_form_completions`; medical action writes to `user_medical_profiles`; `getTeamFormsProgress` queries new table
- `actions/roster.ts` — `isUserRectorOnUpcomingWeekend` checks actual roster assignments, not gender
- `services/weekend/repository.ts` — Strip migrated columns from `WeekendRosterQuery`; join `weekend_groups` to restore `number` field on weekends
- `services/weekend/weekend-service.ts` — Update `getWeekendRosterRecord` and `recordManualPayment` to target `weekend_group_member`; update `normalizeRosterMember` to remove migrated fields
- `services/weekend/types.ts` — Update `RawWeekendRoster` and `WeekendRosterMember` to remove migrated fields
- `services/payment/types.ts` — Add `weekend_group_member` to `TargetTypeSchema`
- `services/payment/actions.ts` — `hasTeamPayment` uses `weekend_group_member` target type
- `services/stripe/handlers/checkout-session-completed.ts` — `handleTeamPayment` reads `group_member_id` from metadata; targets `weekend_group_member`
- `app/(public)/payment/team-fee/page.tsx` — Derive `groupMemberId` from logged-in user's active group; remove hard `weekend_id` requirement
- `app/(public)/team-forms/layout.tsx` — Pass `groupMemberId` to `getTeamFormsProgress`
- `app/(public)/team-forms/statement-of-belief/page.tsx` — Pass `groupMemberId` to form component
- `app/(public)/team-forms/commitment-form/page.tsx` — Pass `groupMemberId` to form component
- `app/(public)/team-forms/release-of-claim/page.tsx` — Pass `groupMemberId` to form component
- `app/(public)/team-forms/camp-waiver/page.tsx` — Pass `groupMemberId` to form component
- `app/(public)/team-forms/info-sheet/page.tsx` — Fetch medical data from `user_medical_profiles` instead of `weekend_roster`
- `components/team-forms/statement-of-belief-form.tsx` — Rename `rosterId` prop to `groupMemberId`
- `components/team-forms/commitment-form-component.tsx` — Rename `rosterId` prop to `groupMemberId`
- `components/team-forms/release-of-claim-form.tsx` — Rename `rosterId` prop to `groupMemberId`
- `components/team-forms/camp-waiver-form.tsx` — Rename `rosterId` prop to `groupMemberId`
- `components/team-forms/team-info-form.tsx` — Rename `rosterId` prop to `groupMemberId`; medical save targets `user_medical_profiles`
- `app/admin/weekends/[weekend_id]/page.tsx` — Derive breadcrumb label from group number + weekend type
- `components/navbar/navbar-client.tsx` — Confirm team-membership check uses presence of `teamMemberInfo`, not gender

### Notes

- Run `yarn db:generate` immediately after each migration task completes; TypeScript errors will guide what needs updating.
- Run `yarn db:reset` (not just `migrate`) when validating the full migration chain.
- Each task ends with a passing `yarn build` gate before moving on.
- Do not commit TypeScript errors across task boundaries.
- Stripe webhook metadata contract change (Task 3) and the client checkout page must be updated atomically — test locally with Stripe CLI before marking Task 3 complete.

## Tasks

### [x] 1.0 Schema Foundation Migrations

**Purpose:** Introduce all new tables additively, backfill data from existing columns, then drop the
migrated columns. After this task `yarn db:reset` runs cleanly and the new tables are populated.
No application code changes yet.

#### 1.0 Proof Artifact(s)

- CLI: `yarn db:reset` completes with zero errors on a fresh database
- DB inspection: `SELECT * FROM weekend_groups` returns one row per former `group_id` with
  `number` populated
- DB inspection: `SELECT * FROM weekend_group_members` returns one row per distinct
  `(group_id, user_id)` pair from `weekend_roster`
- DB inspection: `SELECT * FROM team_form_completions` returns migrated rows keyed to
  `weekend_group_member_id`
- DB inspection: `SELECT * FROM user_medical_profiles` returns populated rows for users that
  had prior emergency/medical data
- DB inspection: `\d weekend_roster` confirms the five `completed_*_at` columns and three
  medical columns are gone; `special_needs` remains

#### 1.0 Tasks

- [x] 1.1 Write `supabase/migrations/YYYYMMDDHHMMSS_weekend_groups.sql`:
  - Create `weekend_groups(id uuid PK, number integer NOT NULL, created_at timestamptz DEFAULT now())`
  - Insert one row per distinct `group_id` in `weekends`, copying `number` from the first matching weekend row
  - Add `ALTER TABLE weekends ADD CONSTRAINT weekends_group_id_fkey FOREIGN KEY (group_id) REFERENCES weekend_groups(id)`
  - Drop `weekends.number` column
- [x] 1.2 Write `supabase/migrations/YYYYMMDDHHMMSS_weekend_group_members.sql`:
  - Create `weekend_group_members(id uuid PK DEFAULT gen_random_uuid(), group_id uuid FK→weekend_groups ON DELETE CASCADE, user_id uuid FK→users ON DELETE CASCADE, created_at timestamptz DEFAULT now(), UNIQUE(group_id, user_id))`
  - Backfill: `INSERT INTO weekend_group_members(group_id, user_id) SELECT DISTINCT wg.id, wr.user_id FROM weekend_roster wr JOIN weekends w ON w.id = wr.weekend_id JOIN weekend_groups wg ON wg.id = w.group_id WHERE wr.user_id IS NOT NULL ON CONFLICT DO NOTHING`
- [x] 1.3 Write `supabase/migrations/YYYYMMDDHHMMSS_team_form_completions.sql`:
  - Create `team_form_completions(id uuid PK DEFAULT gen_random_uuid(), weekend_group_member_id uuid FK→weekend_group_members ON DELETE CASCADE, form_type text NOT NULL, completed_at timestamptz NOT NULL, UNIQUE(weekend_group_member_id, form_type))`
  - Backfill all five forms per member using a single CTE that unions the five `completed_*_at` columns across roster rows into (`weekend_group_member_id`, `form_type`, `completed_at`) rows, taking `MAX(completed_at)` per pair on conflict
  - Use these `form_type` string values (must match `required-forms.config.ts` later): `statement_of_belief`, `commitment_form`, `release_of_claim`, `camp_waiver`, `info_sheet`
  - Drop the five `completed_*_at` columns from `weekend_roster`
- [x] 1.4 Write `supabase/migrations/YYYYMMDDHHMMSS_user_medical_profiles.sql`:
  - Create `user_medical_profiles(user_id uuid PK FK→users ON DELETE CASCADE, emergency_contact_name text, emergency_contact_phone text, medical_conditions text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now())`
  - Add RLS: enable row security; `SELECT` policy allows `auth.uid() = user_id`; `INSERT`/`UPDATE` policy allows `auth.uid() = user_id`; service-role bypasses RLS by default
  - Backfill: for each distinct `user_id` in `weekend_roster` that has any non-null medical value, insert one profile row taking the most recent non-null value per column (join to `weekends` on `weekend_id`, order by `created_at DESC` within each user group)
  - Drop `emergency_contact_name`, `emergency_contact_phone`, and `medical_conditions` from `weekend_roster`
- [x] 1.5 Run `yarn db:reset` locally and confirm it completes with zero errors; verify all four new tables exist and contain expected row counts

---

### [x] 2.0 Form Completion and Medical Info Service Rework

**Purpose:** Update all server-side form and medical-info logic to use the new normalized tables.
After this task a single-weekend volunteer can complete team forms and update medical info with
no regression; data lands in `team_form_completions` and `user_medical_profiles` respectively.

#### 2.0 Proof Artifact(s)

- Screenshot: A team member submits the Statement of Belief form; `team_form_completions`
  shows exactly one new row for their `weekend_group_member_id`; the stepper advances
- Screenshot: The Info Sheet page shows emergency contact and medical fields pre-filled from
  `user_medical_profiles`, and saving updates that profile
- CLI: `yarn build` passes with no TypeScript errors after `yarn db:generate`

#### 2.0 Tasks

- [x] 2.1 Run `yarn db:generate` to regenerate `database.types.ts` after Task 1 migrations; fix any immediate TypeScript compilation errors caused by the dropped columns
- [x] 2.2 Create `lib/weekend/team/required-forms.config.ts` exporting a `REQUIRED_FORMS` array of objects `{ key: string; label: string }` for the five forms in sequential order (`statement_of_belief`, `commitment_form`, `release_of_claim`, `camp_waiver`, `info_sheet`); this is the single config source used everywhere form_type strings are needed
- [x] 2.3 Create `services/weekend-group-member/repository.ts` with:
  - `getGroupMemberByRosterId(rosterId)` — joins `weekend_group_members` through `weekends` + `weekend_roster` to return the `weekend_group_member` row for a given roster ID
  - `upsertFormCompletion(groupMemberId, formType, completedAt)` — `INSERT INTO team_form_completions ... ON CONFLICT (weekend_group_member_id, form_type) DO UPDATE SET completed_at = EXCLUDED.completed_at`
  - `getFormCompletions(groupMemberId)` — returns all `team_form_completions` rows for a given member
- [x] 2.4 Create `services/weekend-group-member/weekend-group-member-service.ts` with:
  - `getTeamFormsProgress(groupMemberId)` — fetches completions via repository, builds the same `TeamFormsProgress` shape currently returned by the action in `actions/team-forms.ts`, using `REQUIRED_FORMS` config to drive the step list
  - `hasCompletedAllTeamForms(groupMemberId)` — delegates to `getTeamFormsProgress`
- [x] 2.5 Create `services/weekend-group-member/types.ts`, `services/weekend-group-member/index.ts` (re-export actions and types)
- [x] 2.6 Update `actions/team-forms.ts` — rewrite all six form-completion actions (`signStatementOfBelief`, `signCommitmentForm`, `signCampWaiver`, `completeInfoSheet`, `submitReleaseOfClaim`, `getTeamFormsProgress`, `hasCompletedAllTeamForms`) to:
  - Accept `rosterId` as before (backward-compatible signatures for now; changed in Task 4)
  - Call `getGroupMemberByRosterId(rosterId)` to obtain `groupMemberId`; return `err` if not found
  - Call `upsertFormCompletion(groupMemberId, formType, now())` instead of updating `weekend_roster`
  - `getTeamFormsProgress` and `hasCompletedAllTeamForms` delegate to the new service functions
- [x] 2.7 Update `submitReleaseOfClaim` specifically: after upserting the form completion, also update `special_needs` on **all** active `weekend_roster` rows where the user's `user_id` matches and `weekends.group_id` matches the group — use an admin Supabase client for this multi-row update
- [x] 2.8 Remove the now-unused medical columns from `services/weekend/repository.ts` `WeekendRosterQuery` constant and from the `RawWeekendRosterDB` type; remove `emergency_contact_name`, `emergency_contact_phone`, and `medical_conditions` from `services/weekend/types.ts` `RawWeekendRoster` and `WeekendRosterMember`; update `normalizeRosterMember` in `weekend-service.ts` accordingly
- [x] 2.9 Remove the `completed_*_at` columns from `services/weekend/repository.ts` `WeekendRosterQuery` and `RawWeekendRosterDB`; update `normalizeRosterMember` to set `forms_complete` by querying `team_form_completions` via the group-member service (or accept it as a pre-fetched boolean)
- [x] 2.10 Create a helper function `getUserMedicalProfile(userId)` in `services/weekend-group-member/repository.ts` that fetches from `user_medical_profiles`; create a corresponding service function that returns the profile (or null if not found)
- [x] 2.11 Update `updateRosterMedicalInfo` action in `actions/team-forms.ts` to write to `user_medical_profiles` keyed by `userId` (upsert) rather than updating `weekend_roster`; update the function signature to accept `userId` instead of `rosterId`
- [x] 2.12 Update `app/(public)/team-forms/info-sheet/page.tsx` to call `getUserMedicalProfile(user.id)` for initial values instead of querying `weekend_roster` directly
- [x] 2.13 Update `components/team-forms/team-info-form.tsx` to pass `userId` (not `rosterId`) to the medical-info save action
- [x] 2.14 Run `yarn build` and confirm zero TypeScript errors before proceeding

---

### [ ] 3.0 Payment Rework (target_type and Stripe contract)

**Purpose:** Update the team-fee payment flow so payment records target `weekend_group_member`
instead of `weekend_roster`. Includes the Stripe checkout metadata change, webhook handler
update, manual-payment flow, and admin weekend label derivation. After this task, a
single-weekend volunteer's payment creates one `payment_transaction` row with
`target_type = 'weekend_group_member'`.

#### 3.0 Proof Artifact(s)

- Screenshot: The team-fee checkout page initiates correctly and the resulting
  `payment_transaction` row has `target_type = 'weekend_group_member'` and the correct
  `target_id`
- Screenshot: An admin weekend page shows a label such as "Group 47 — Men's" derived from
  `weekend_groups.number` plus weekend type
- Screenshot: The manual-payment admin flow creates one `payment_transaction` row targeted at
  `weekend_group_member`
- CLI: `yarn build` passes with no TypeScript errors after updating payment types and
  running `yarn db:generate`

#### 3.0 Tasks

- [ ] 3.1 Write `supabase/migrations/YYYYMMDDHHMMSS_payment_intent_unique_index.sql`: add `CREATE UNIQUE INDEX payment_transaction_payment_intent_id_key ON payment_transaction(payment_intent_id) WHERE payment_intent_id IS NOT NULL`; run `yarn db:reset` to validate, then `yarn db:generate`
- [ ] 3.2 Add `'weekend_group_member'` to `TargetTypeSchema` in `services/payment/types.ts` (the `z.enum` that currently lists `'candidate'` and `'weekend_roster'`); update `RawPaymentWithRoster` and related union types if they reference `weekend_roster` by name in joins
- [ ] 3.3 Update `services/weekend/repository.ts` to join `weekend_groups` when fetching weekends, restoring the `number` field from the group row (e.g., `weekends(*, weekend_groups(number))`); update `RawWeekendRecord` and `normalizeWeekend` in `weekend-service.ts` to populate `Weekend.number` from `weekend_groups.number`
- [ ] 3.4 Update the weekend detail page breadcrumb in `app/admin/weekends/[weekend_id]/page.tsx` to derive the title as `"Group {number} — {Type}"` (e.g., `"Group 47 — Men's"`) using the group number from the joined `weekend_groups` record rather than `weekend.number` directly; update `formatWeekendTitle` in `lib/weekend/index.ts` if it references `weekend.number`
- [ ] 3.5 Add `getActiveGroupMemberForUser(userId)` to `services/weekend-group-member/repository.ts`: query `weekend_group_members` joined through `weekend_groups` to the active `weekends` rows, returning the member row for the active group
- [ ] 3.6 Update `app/(public)/payment/team-fee/page.tsx`:
  - Remove the `weekend_id` required `searchParams` check
  - Call `getActiveGroupMemberForUser(user.id)` to obtain `groupMemberId`; show the existing "not on roster" alert if not found
  - Pass `{ group_member_id: groupMemberId, payment_owner: payerName }` as Stripe metadata (drop `weekend_id` from required fields; it may still be included as informational)
- [ ] 3.7 Add `getGroupMemberById(groupMemberId)` to `services/weekend-group-member/repository.ts` (used by the webhook)
- [ ] 3.8 Update `handleTeamPayment` in `services/stripe/handlers/checkout-session-completed.ts`:
  - Read `group_member_id` from `session.metadata` instead of `user_id + weekend_id`
  - Validate `group_member_id` is non-null; return webhook error if missing
  - Call `getGroupMemberById(groupMemberId)` with admin client to verify it exists
  - Record payment with `target_type: 'weekend_group_member'`, `target_id: groupMemberId`
  - Remove the call to `getWeekendRosterRecord` and `markTeamMemberAsPaid` (status field `paid` on `weekend_roster` is no longer the payment signal; payment existence in `payment_transaction` is the signal)
  - Keep the `notifyAssistantHeadForTeamPayment` call; derive `weekendId` from the group-member record for the notification
- [ ] 3.9 Update `hasTeamPayment` in `services/payment/actions.ts` to call `hasPaymentForTarget('weekend_group_member', groupMemberId)` instead of `'weekend_roster'`
- [ ] 3.10 Update `recordManualPayment` in `services/weekend/weekend-service.ts` to accept `groupMemberId` instead of `weekendRosterId`; change the `target_type` to `'weekend_group_member'` and `target_id` to `groupMemberId`; update any admin UI that calls this function
- [ ] 3.11 Run `yarn build` and confirm zero TypeScript errors

---

### [ ] 4.0 Multi-Weekend Volunteer Experience

**Purpose:** Reshape `User.teamMemberInfo` into a group-scoped object with an `assignments[]`
array so a volunteer on both weekends sees shared form state, shared payment state, and a single
set of homepage TODOs. Single-weekend volunteer experience is unchanged from their perspective.

#### 4.0 Proof Artifact(s)

- Demo flow: A test user is added to both the men's and women's `weekend_roster` rows for the
  same active group; they complete all team forms and pay the team fee once; the database shows
  one `weekend_group_member`, one shared set of `team_form_completions`, and one
  `payment_transaction`, while both admin weekend roster pages reflect the shared state
- Screenshot: The homepage TODO list shows a single "Complete team forms" item and a single
  "Pay team fees" item for the cross-weekend user
- Screenshot: A single-weekend volunteer's homepage TODO list and form stepper are unchanged
- CLI: `yarn build` completes with zero TypeScript errors after all consumer updates

#### 4.0 Tasks

- [ ] 4.1 Add `TeamAssignment` type to `lib/weekend/types.ts`: `{ id: string; weekend_id: string | null; cha_role: string | null; status: string | null }`; reshape `TeamMemberInfo` to `{ groupMemberId: string; groupId: string; assignments: TeamAssignment[] }`; remove the old flat fields (`id`, `cha_role`, `status`, `weekend_id`) from `TeamMemberInfo`
- [ ] 4.2 Update `JoinWeekendRosterOnUserId` in `services/identity/user/repository.ts` to also fetch `weekend_group_members` with `group_id` and join back to `weekend_roster` through the group; or alternatively query `weekend_group_members` directly and join `weekend_roster` rows from there
- [ ] 4.3 Update `RawUser` in `services/identity/user/types.ts` to reflect the new join shape (group-member row with nested roster assignments)
- [ ] 4.4 Rewrite the `teamMemberInfo` derivation block in `normalizeUser` (`services/identity/user/user-service.ts`): instead of `.find()` on `weekend_roster` for the first active row, collect **all** `weekend_roster` rows belonging to the active group via `weekend_group_members`; build `{ groupMemberId, groupId, assignments: [...] }` or return `null` if no active group membership exists
- [ ] 4.5 Update `TeamMemberUser` in `lib/users/types.ts` if its definition depends on the old `TeamMemberInfo` shape; ensure it still compiles and correctly narrows `teamMemberInfo` to non-null
- [ ] 4.6 Update `app/(public)/team-forms/layout.tsx`: change `getTeamFormsProgress(user.teamMemberInfo.id)` to `getTeamFormsProgress(user.teamMemberInfo.groupMemberId)`
- [ ] 4.7 Update the five team form pages to pass `groupMemberId` instead of roster `id`:
  - `statement-of-belief/page.tsx`: change `rosterId={user.teamMemberInfo.id}` → `groupMemberId={user.teamMemberInfo.groupMemberId}`
  - `commitment-form/page.tsx`: same rename
  - `release-of-claim/page.tsx`: same rename; also update the redirect guard that currently reads `user.teamMemberInfo.weekend_id` to use `user.teamMemberInfo.assignments[0]?.weekend_id`
  - `camp-waiver/page.tsx`: same rename
  - `info-sheet/page.tsx`: same rename; medical pre-fill already reads from `user_medical_profiles` (Task 2)
- [ ] 4.8 Rename `rosterId` → `groupMemberId` in the five form components (`statement-of-belief-form.tsx`, `commitment-form-component.tsx`, `release-of-claim-form.tsx`, `camp-waiver-form.tsx`, `team-info-form.tsx`) and update the prop type to `groupMemberId: string`
- [ ] 4.9 Update form action signatures in `actions/team-forms.ts` to accept `groupMemberId` directly (remove the internal `getGroupMemberByRosterId` bridge introduced in Task 2); the parameter name changes from `rosterId` to `groupMemberId` throughout
- [ ] 4.10 Update `lib/weekend/team/todos.config.ts`:
  - `checkCompletion` for `team-info` todo: call `hasCompletedAllTeamForms(user.teamMemberInfo.groupMemberId)`
  - `checkCompletion` for `team-payment` todo: call `hasTeamPayment(user.teamMemberInfo.groupMemberId)`
  - Remove the `params` function on the `team-payment` todo (no longer needs `?weekend_id=` query param)
- [ ] 4.11 Update `lib/weekend/team/todos.actions.ts` (`getTeamTodoData`): replace `user.teamMemberInfo.weekend_id` with `user.teamMemberInfo.assignments[0]?.weekend_id` for the weekend lookup used in URL generation; if no assignments exist return `null`
- [ ] 4.12 Update `actions/roster.ts` `isUserRectorOnUpcomingWeekend`: remove the `users.gender` lookup and the `genderMatchesWeekend` inference; instead check if any `weekend_roster` row for the user in the active group has `cha_role = 'Rector'` (query directly via `weekend_group_members → weekends → weekend_roster`)
- [ ] 4.13 Verify `components/navbar/navbar-client.tsx` uses `!!user.teamMemberInfo` (presence check only) and not any gender-derived weekend-matching logic; update if it does
- [ ] 4.14 Update `getWeekendRoster` in `services/weekend/weekend-service.ts` so that the `forms_complete` and payment status on each `WeekendRosterMember` row reflect the shared `weekend_group_member` state: fetch payment via `getPaymentForTarget('weekend_group_member', groupMemberId)` and fetch form completions via the group-member service
- [ ] 4.15 Add `groupMemberId` to the `WeekendRosterMember` type in `services/weekend/types.ts` so the admin roster table can display shared status; update `normalizeRosterMember` to populate it
- [ ] 4.16 Create a test scenario in the local seed (`supabase/seed.sql` or a manual setup script note in the PR description) that adds the same user to both `weekend_roster` rows for the active group; run through the full flow manually to confirm one set of forms, one payment, and one homepage TODO
- [ ] 4.17 Run `yarn build` and confirm zero TypeScript errors
