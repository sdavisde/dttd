# 15-audit-user-profile-pictures.md

## Executive Summary

- Overall Status: FAIL
- Required Gate Failures: 1
- Flagged Risks: 2

## Gateboard

| Gate                             | Status | Why it failed (<=10 words)                                | Exact fix target                  |
| -------------------------------- | ------ | --------------------------------------------------------- | --------------------------------- |
| Requirement-to-test traceability | FAIL   | Input validation FR has no mapped test                    | `## Tasks > 3.0` + Relevant Files |
| Proof artifact verifiability     | PASS   | —                                                         | —                                 |
| Repository standards consistency | PASS   | —                                                         | —                                 |
| Open question resolution         | PASS   | —                                                         | —                                 |
| Regression-risk blind spots      | FLAG   | RLS write-isolation + query edits not behaviorally tested | `## Tasks > 1.0`, `5.0`           |
| Non-goal leakage                 | PASS   | —                                                         | —                                 |

## Standards Evidence Table

| Source File                         | Read      | Standards Extracted                                                                                    | Conflicts |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ | --------- |
| `README.md` (root)                  | yes       | Yarn workflow; DB flow `yarn db:migrate`→`db:reset`→`db:generate`                                      | none      |
| `CLAUDE.md`                         | yes       | shadcn-only; `Result`/`Results.*`; `toastError`; `isNil`; action→service→repository; responsive tables | none      |
| `commitlint.config.js`              | yes       | Conventional Commits; header ≤100; lowercase type                                                      | none      |
| `eslint.config.mjs`                 | yes       | `yarn lint` over `.ts,.tsx`; lint-staged pre-commit                                                    | none      |
| `jest.config.ts` + co-located tests | yes       | Jest via `yarn test`; co-locate `.test.ts`; no `__tests__`                                             | none      |
| `AGENTS.md`                         | not found | —                                                                                                      | —         |

## Findings

### REQUIRED Failures

1. Input-validation functional requirement has no mapped test artifact
   - Missing item: Spec Unit 2 requires client-side validation (accept jpeg/png/webp,
     reject >5MB, friendly error). Validation currently lives only inside the cropper
     dialog (task 3.4) with no testable unit.
   - File section to edit: `## Relevant Files` (add `lib/avatar/validate-file.ts` +
     `lib/avatar/validate-file.test.ts`); `## Tasks > 3.0` proof artifacts + sub-task 3.4.
   - Acceptance condition: A pure `validateAvatarFile(file)` helper exists with a jest test
     covering accepted types, rejected type, and oversize rejection; cropper dialog calls it.

### FLAG Findings

1. RLS owner-only write isolation is not behaviorally verified
   - Risk: The migration declares owner-only write, but nothing verifies user A cannot
     overwrite user B's `{uid}.webp`. A policy typo would silently allow cross-user writes.
   - Suggested remediation: Add a sub-task under 1.0 to verify enforcement (a short SQL/
     psql check or documented manual test as a proof artifact) — not a blocking gate.

2. Surface rollout (Task 5) edits ~7 existing queries with only tsc/lint as guard
   - Risk: Adding columns to shared queries (roster, master roster, pickers) could regress
     existing data rendering; type/lint checks won't catch a broken join or dropped field.
   - Suggested remediation: Add a spot-check checklist proof artifact (each surface still
     lists the same people with correct names) to task 5.9.

## User-Approved Remediation Plan

- Pending approval
- Proposed edits:
  1. (Resolves REQUIRED) Add `lib/avatar/validate-file.ts` + test to Relevant Files; update
     task 3.4 to use it; add a test proof artifact to 3.0.
  2. (Resolves FLAG 1) Add sub-task 1.8: verify RLS write-isolation; add as a 1.0 proof artifact.
  3. (Resolves FLAG 2) Add a regression spot-check proof artifact to 5.0.
