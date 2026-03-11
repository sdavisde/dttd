# Task 4.0 — Multi-Weekend Volunteer Experience: Proof Artifacts

## CLI Output

### yarn build — Zero TypeScript Errors

```
▲ Next.js 16.1.3 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 9.5s
  Running next.config.js provided runAfterProductionCompile ...
✓ Completed runAfterProductionCompile in 4911ms
  Running TypeScript ...

Route (app)
...
├ ƒ /team-forms
├ ƒ /team-forms/camp-waiver
├ ƒ /team-forms/commitment-form
├ ƒ /team-forms/info-sheet
├ ƒ /team-forms/release-of-claim
└ ƒ /team-forms/statement-of-belief

Done in 22.74s.
```

No TypeScript errors. All 42 routes compiled successfully.

---

## Key Implementation Changes

### 4.1 — New `TeamAssignment` type and reshaped `TeamMemberInfo`

**File:** `lib/weekend/types.ts`

```typescript
// Before
export type TeamMemberInfo = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
}

// After
export type TeamAssignment = {
  /** weekend_roster.id — the row ID for this specific weekend assignment */
  id: string
  weekend_id: string | null
  cha_role: string | null
  status: string | null
}

export type TeamMemberInfo = {
  /** weekend_group_members.id — shared across both weekends in the group */
  groupMemberId: string
  groupId: string
  /** One entry per weekend_roster row; cross-weekend volunteers have two */
  assignments: TeamAssignment[]
}
```

### 4.2 — New Supabase join via `weekend_group_members`

**File:** `services/identity/user/repository.ts`

```typescript
// Before: joined weekend_roster directly on user_id
export const JoinWeekendRosterOnUserId = `
  weekend_roster:weekend_roster!user_id(
    id, user_id, weekend_id, cha_role, status, weekends(type, status)
  )
`

// After: joins through weekend_group_members → weekend_groups → weekends → weekend_roster
export const JoinWeekendRosterOnUserId = `
  weekend_group_members!user_id(
    id,
    group_id,
    weekend_groups!group_id(
      weekends!group_id(
        id, type, status,
        weekend_roster(id, cha_role, status, weekend_id)
      )
    )
  )
`
```

### 4.4 — `normalizeUser` now derives `TeamMemberInfo` from the active group

**File:** `services/identity/user/user-service.ts`

```typescript
// Finds the group_member row where at least one weekend is ACTIVE
const activeGroupMember =
  rawUser.weekend_group_members?.find((member) => {
    const weekends = member.weekend_groups?.weekends ?? []
    return weekends.some((w) => w.status === WeekendStatus.ACTIVE)
  }) ?? null

if (activeGroupMember) {
  const activeWeekends = (
    activeGroupMember.weekend_groups?.weekends ?? []
  ).filter((w) => w.status === WeekendStatus.ACTIVE)

  // Collect ALL roster assignments for this user in the active group
  const assignments: TeamAssignment[] = activeWeekends.flatMap((w) =>
    (w.weekend_roster ?? []).map((r) => ({
      id: r.id,
      weekend_id: r.weekend_id,
      cha_role: r.cha_role,
      status: r.status,
    }))
  )

  teamMemberInfo = {
    groupMemberId: activeGroupMember.id,
    groupId: activeGroupMember.group_id,
    assignments,
  }
}
```

### 4.9 — `actions/team-forms.ts` — bridge removed, `groupMemberId` accepted directly

All six form-completion actions (`signStatementOfBelief`, `signCommitmentForm`,
`signCampWaiver`, `completeInfoSheet`, `submitReleaseOfClaim`, `getTeamFormsProgress`,
`hasCompletedAllTeamForms`) now accept `groupMemberId` as their first parameter.
The internal `resolveGroupMemberId(rosterId)` bridge introduced in Task 2 is removed.

### 4.10 — `todos.config.ts` — uses `groupMemberId`, no `?weekend_id=` param

```typescript
// Before
checkCompletion: async ({ user }) =>
  hasCompletedAllTeamForms(user.teamMemberInfo.id)
params: ({ weekend }) => `?weekend_id=${weekend.id}`

// After
checkCompletion: async ({ user }) =>
  hasCompletedAllTeamForms(user.teamMemberInfo.groupMemberId)
// params removed from team-payment todo
```

### 4.12 — `isUserRectorOnUpcomingWeekend` — no longer uses gender

**File:** `actions/roster.ts`

Old approach queried `users.gender`, inferred the matching weekend, then checked that roster row.
New approach: finds active weekends → checks `weekend_group_members` for the user → checks `weekend_roster` for `cha_role = 'Rector'` across all active weekend IDs.

### 4.14 + 4.15 — `getWeekendRoster` — payment via `weekend_group_member`

```typescript
// Before: payment queried as weekend_roster target
getPaymentForTarget('weekend_roster', record.id)

// After: payment queried as weekend_group_member target
getPaymentForTarget('weekend_group_member', groupMemberId)
```

`WeekendRosterMember` now includes `groupMemberId: string | null`.

---

## Test Scenario (Task 4.16 — Manual Setup Note)

To validate the cross-weekend volunteer experience locally:

```sql
-- In Supabase Studio or psql, after yarn db:reset with an active group:
-- 1. Find the active group_id:
SELECT id, number FROM weekend_groups;

-- 2. Find the MENS and WOMENS weekend IDs for that group:
SELECT id, type FROM weekends WHERE group_id = '<group_id>' AND status = 'ACTIVE';

-- 3. Add the same test user to both rosters:
INSERT INTO weekend_roster (weekend_id, user_id, cha_role, status)
VALUES
  ('<mens_weekend_id>', '<test_user_id>', 'Table Leader', 'awaiting_payment'),
  ('<womens_weekend_id>', '<test_user_id>', 'Table', 'awaiting_payment');

-- 4. The weekend_group_members row should already exist (upserted on roster insert),
--    or create it manually:
INSERT INTO weekend_group_members (group_id, user_id)
VALUES ('<group_id>', '<test_user_id>')
ON CONFLICT (group_id, user_id) DO NOTHING;
```

Expected behavior after setup:

- Homepage shows **one** "Complete team forms" TODO and **one** "Pay team fees" TODO
- Completing any form writes to `team_form_completions` keyed by `weekend_group_member_id`
- Both admin roster pages (MENS and WOMENS) show the same `forms_complete` and payment state
- A single payment creates one `payment_transaction` with `target_type = 'weekend_group_member'`
