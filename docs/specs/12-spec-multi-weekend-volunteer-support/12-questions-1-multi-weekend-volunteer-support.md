# 12 Questions Round 1 - Multi-Weekend Volunteer Support

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

---

## 1. Medical & Emergency Contact Data — Where Should It Live?

Currently `emergency_contact_name`, `emergency_contact_phone`, and `medical_conditions` are stored on each `weekend_roster` row, meaning a volunteer fills them out fresh every time they serve. Where should this data live going forward?

- [x] (A) Move to the `users` table — one set of fields per person, pre-filled when they start team forms
- [ ] (B) Keep on `weekend_roster` but pre-fill from the user's most recent values — so it's still per-assignment but not blank every time
- [ ] (C) Create a separate `user_medical_profile` table — keeps medical data isolated from general user data
- [ ] (D) Other (describe)

---

## 2. Special Needs (`special_needs` on `weekend_roster`) — Per-Assignment or Per-Person?

`special_needs` is currently saved on each roster row when a volunteer submits the Release of Claim form. Unlike medical history, special needs _could_ legitimately differ between weekends (e.g., "I need a ground-floor bunk this weekend"). Should it stay per-assignment or move with medical data?

- [x] (A) Keep `special_needs` per-assignment on `weekend_roster` — it can vary by weekend
- [ ] (B) Move it to the user too — in practice it's the same person-to-person
- [ ] (C) Other (describe)

---

## 3. Form Completions — New Table or Keep Columns?

Right now form completion is tracked as 5 nullable timestamp columns on `weekend_roster` (`completed_statement_of_belief_at`, etc.). The proposed Option B replaces these with a `team_form_completions` table (one row per form per roster assignment).

- [x] (A) Yes — replace the 5 columns with a `team_form_completions` table (makes adding/removing forms a config change, not a schema change)
- [ ] (B) No — keep the 5 columns, just fix the multi-weekend bug at the app layer (less migration risk)
- [ ] (C) Other (describe)

---

## 4. Existing Form Completion Data — Migrate or Reset?

If we go with a new `team_form_completions` table (Question 3 option A), what should happen to existing form completion records?

- [x] (A) Migrate existing data — write a migration script to copy existing timestamps into the new table
- [ ] (B) Don't migrate — existing form data is close enough to irrelevant (weekend is finishing or hasn't started), volunteers can re-submit
- [ ] (C) Other (describe)

---

## 5. Weekend Groups — Make the Table Explicit?

Currently the men's and women's weekends of a group are linked by a shared `group_id` UUID on each `weekends` row, but there's no actual `weekend_groups` table. Should we create one?

- [x] (A) Yes — create a `weekend_groups` table with a label/name field (enables group-level metadata later). Each weekend should be part of a weekend group, which removes the need to track "weekend number" on the weekend level. Each weened now only needs a gender column really, and the number can be at the group level. The server service layer can normalize a 'label' from a combination of those attributes.
- [ ] (B) No — the shared UUID is good enough for now, just fix the app-layer assumptions
- [ ] (C) Other (describe)

---

## 6. Multi-Weekend UI — How Should Team Forms Work for Someone on Both Weekends?

A spiritual director on both weekends needs to complete forms and pay fees for each. How should the app present this?

- [ ] (A) Weekend selector on the team forms page — a toggle or dropdown to switch between "Men's Weekend" and "Women's Weekend" contexts, with separate form completion state per weekend
- [ ] (B) Separate cards on the homepage — one "Complete forms" card per weekend they're assigned to, each linking to the forms for that specific weekend
- [ ] (C) Both A and B — cards on homepage per weekend, and a context-aware forms page
- [x] (D) Other (describe) - they should only have to complete forms and pay fees once.

---

## 7. `genderMatchesWeekend()` Utility — Keep or Remove?

This function hard-codes `male → MENS weekend`, `female → WOMENS weekend`. It's used in filtering/validation logic. For the multi-weekend scenario, gender should NOT determine which weekend someone serves on — their roster assignment does.

- [ ] (A) Remove it — assignment is the source of truth, gender should not gate weekend participation
- [x] (B) Keep it for candidate filtering only — candidates are still matched to weekends by gender; only volunteer assignments should ignore it
- [ ] (C) Other (describe)

---

## 8. Roster Page Tab — Default Behavior for Cross-Weekend Volunteers?

The public roster page currently defaults the tab to the weekend matching the user's gender. For someone serving the opposite-gender weekend, they have to manually switch.

- [ ] (A) Default to the weekend they're actually assigned to (if they have one roster assignment)
- [ ] (B) If on both weekends, default to the first one assigned; show both tabs equally
- [x] (C) Low priority — leave this as-is for now, fix the functional bugs first
- [ ] (D) Other (describe)

---

## 9. Scope — Is `users_experience` (historical service record) In or Out of This Spec?

Option C from our earlier discussion would unify `users_experience` (past service history) with `weekend_roster` (current assignments). Option B leaves that for later.

- [x] (A) Out of scope — don't touch `users_experience` in this spec
- [ ] (B) In scope — while we're refactoring the assignment model, let's unify the historical record too
- [ ] (C) Other (describe)
