# Task 2.0 Proof Artifacts — Community Data Fetching & Eligibility System

## CLI Verification

### TypeScript Compilation

```
$ npx tsc --noEmit
(no output — zero errors)
```

### Lint Check

```
$ npx eslint services/roster-builder/ lib/users/experience/calculations.ts
(no output — zero errors)
```

## Service Layer Files Created

| File                                                | Purpose                                                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `services/roster-builder/types.ts`                  | `RosterBuilderCommunityMember`, `AssignmentStatus`, `EligibilityResult`, `RawCommunityUser` types                                      |
| `services/roster-builder/eligibility.ts`            | Extendable eligibility registry: `CHARole → check function` with Head/Asst Head and Rover rules                                        |
| `services/roster-builder/repository.ts`             | 4 queries: `findAllUsersWithExperience`, `findSecuelaAttendees`, `findRosterAssignments`, `findDraftAssignments`, `findWeekendGroupId` |
| `services/roster-builder/roster-builder-service.ts` | `getRosterBuilderCommunityData(weekendId)` — orchestrates parallel queries and computes all derived fields                             |
| `services/roster-builder/actions.ts`                | Server action: `getRosterBuilderCommunityData`                                                                                         |
| `services/roster-builder/index.ts`                  | Public API exports                                                                                                                     |

## Eligibility System

Implemented as an extendable `Partial<Record<CHARole, EligibilityCheck>>` map in `eligibility.ts`:

- **Head**: requires `hasBeenSectionHead` AND `hasGivenRollo`
- **Assistant Head**: requires `hasBeenSectionHead` AND `hasGivenRollo`
- **Rover**: requires `rectorReadyStatus.isReady`

To add new rules, add a new entry to the `ELIGIBILITY_CHECKS` map — no existing code modifications needed.

## Computed Fields per Community Member

The `RosterBuilderCommunityMember` type includes:

- `experienceLevel` — via `calculateExperienceLevel(distinctWeekendCount)`
- `weekendsServed` — via `countDistinctWeekends()`
- `rectorReadyStatus` — via `calculateRectorReadyStatus(experience)`
- `hasBeenSectionHead` — derived from `TEAM_HEAD_ROLES` whitelist (now exported)
- `hasGivenRollo` — any experience record with non-null `rollo`
- `attendsSecuela` — from `weekend_group_members.attends_secuela` for the active group
- `assignmentStatus` — union type: `unassigned` | `draft` (with draftId) | `finalized` (with rosterId)
- `eligibility` — map of role → `{ eligible, reason? }` for roles with requirements

## Data Fetching Strategy

The service runs 4 queries in parallel via `Promise.all`:

1. All users with experience (`users` + `users_experience` join)
2. Roster assignments for the weekend (`weekend_roster`)
3. Draft assignments for the weekend (`draft_weekend_roster`)
4. Secuela attendees for the weekend group (`weekend_group_members`)

## Changes to Existing Code

- **Exported `TEAM_HEAD_ROLES`** from `lib/users/experience/calculations.ts` (was private, now `export const`)
