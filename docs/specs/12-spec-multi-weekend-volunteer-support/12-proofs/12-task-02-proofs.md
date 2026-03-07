# Task 2.0 Proof Artifacts — Form Completion and Medical Info Service Rework

## New Files Created

- `lib/weekend/team/required-forms.config.ts` — REQUIRED_FORMS config array (single source of truth)
- `services/weekend-group-member/repository.ts` — DB queries for group members, form completions,
  medical profiles
- `services/weekend-group-member/weekend-group-member-service.ts` — Business logic for form progress
- `services/weekend-group-member/types.ts` — Raw types from database.types.ts
- `services/weekend-group-member/index.ts` — Public re-exports

## Modified Files

- `actions/team-forms.ts` — All form actions now write to `team_form_completions` via
  `getGroupMemberByRosterId` bridge; `updateRosterMedicalInfo` writes to `user_medical_profiles`
- `services/weekend/repository.ts` — Stripped `completed_*_at` and medical columns from
  `WeekendRosterQuery` and `RawWeekendRosterDB`
- `services/weekend/types.ts` — Removed dropped fields from `RawWeekendRoster` and
  `WeekendRosterMember`; added `special_needs` and pre-fetched `forms_complete`
- `services/weekend/weekend-service.ts` — Updated `normalizeRosterMember`; `getWeekendRoster` now
  fetches `forms_complete` in parallel via group-member service; removed `number` from
  `prepareInsertPayload`
- `lib/weekend/types.ts` — `Weekend.number` kept as nullable (populated in Task 3 join);
  removed `number` from `WeekendWriteInput`
- `app/(public)/team-forms/info-sheet/page.tsx` — Fetches medical info from
  `getUserMedicalProfile(user.id)` instead of `weekend_roster`
- `components/team-forms/team-info-form.tsx` — Passes `userId` to `updateRosterMedicalInfo`
- `components/weekend/roster-view/config/columns.tsx` — Removed emergency/medical columns
- `components/weekend/roster-view/weekend-roster-table.tsx` — Removed MedicalInfoModal wiring
- `components/weekend/roster-view/medical-info-modal.tsx` — Updated to show `special_needs`
- `services/notifications/email-actions.ts` — Removed `weekend.number` reference

## CLI: yarn build

```
✓ Compiled successfully in 7.7s
Done in 28.84s.
```

**Result: ZERO TypeScript errors. Build passes. ✅**

## Architecture Summary

### Form Completion Flow (before → after)

```
Before:
  signStatementOfBelief(rosterId)
    → UPDATE weekend_roster SET completed_statement_of_belief_at = now() WHERE id = rosterId

After:
  signStatementOfBelief(rosterId)
    → getGroupMemberByRosterId(rosterId)  [3-step join: roster → weekend → group_member]
    → upsertFormCompletion(groupMemberId, 'statement_of_belief', now())
      → INSERT INTO team_form_completions ... ON CONFLICT DO UPDATE
```

### Medical Info Flow (before → after)

```
Before:
  updateRosterMedicalInfo(rosterId, {...})
    → UPDATE weekend_roster SET emergency_contact_name=... WHERE id = rosterId

After:
  updateRosterMedicalInfo(userId, {...})
    → UPSERT user_medical_profiles SET ... WHERE user_id = userId
```

### Roster Forms Progress (before → after)

```
Before:
  getWeekendRoster(weekendId)
    → forms_complete from completed_*_at columns on weekend_roster

After:
  getWeekendRoster(weekendId)
    → for each roster member, fetch group_member → count team_form_completions >= 5
```
