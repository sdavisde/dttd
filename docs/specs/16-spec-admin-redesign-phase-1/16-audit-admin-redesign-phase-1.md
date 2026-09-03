# 16-audit-admin-redesign-phase-1.md

## Executive Summary

- Overall Status: PASS
- Required Gate Failures: 0
- Flagged Risks: 2

## Gateboard

| Gate                             | Status | Note                                                                                                                                                  |
| -------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent-task user-verifiability   | PASS   | Every parent states plain-language, observable verification                                                                                           |
| Parent-task vertical slicing     | PASS   | 1.0 delivers a user-visible restyle (spec Unit 1), not an invented layer                                                                              |
| Requirement-to-test traceability | PASS   | Unit tests for all computable logic; UI/CSS FRs map to FR-tagged observable proof artifacts per repo convention (pure-TS Jest only; no RTL installed) |
| Proof artifact verifiability     | PASS   | All artifacts concrete, reproducible, FR-tagged, sanitized (local seed data mandated)                                                                 |
| Repository standards consistency | PASS   | 8 sources read; no conflicts (see precedence note)                                                                                                    |
| Open question resolution         | PASS   | Single OQ carries an explicit default (omit expensive weekend stats), encoded in task 5.1                                                             |
| Regression-risk blind spots      | FLAG   | See finding 1                                                                                                                                         |
| Non-goal leakage                 | FLAG   | See finding 2                                                                                                                                         |

## Standards Evidence Table

| Source File                                              | Read      | Standards Extracted                                                                                                                                   | Conflicts |
| -------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `CLAUDE.md` (root)                                       | yes       | shadcn-only UI; Result pattern + `Results.*`/`toastError`/`isNil`; mobile-card admin mandate; `yarn build` to confirm compilation                     | none      |
| `README.md` (root)                                       | yes       | Design philosophy (logistics, not automated relationships); yarn + supabase CLI workflow; `docs/domain.md` for domain                                 | none      |
| `AGENTS.md`                                              | not found | —                                                                                                                                                     | —         |
| `CONTRIBUTING.md`                                        | not found | —                                                                                                                                                     | —         |
| `.github/pull_request_template.md`                       | not found | —                                                                                                                                                     | —         |
| `package.json`                                           | yes       | `yarn lint` (wraps eslint), `yarn test` (Jest), `yarn build`; lint-staged pre-commit (eslint --fix + prettier)                                        | see note  |
| `commitlint.config.js`                                   | yes       | Conventional types; header ≤ 100 chars; lowercase type; no trailing period                                                                            | none      |
| `.prettierrc` / `eslint.config.mjs`                      | yes       | No semicolons, single quotes, 80-width; type-checked TS rules                                                                                         | none      |
| `.github/workflows/release.yml`                          | yes       | Merges to main run migrations + `supabase config push` + semantic-release + Vercel deploy — no schema/config changes in this spec keeps release inert | none      |
| `docs/specs/15-spec-user-profile-pictures/15-tasks-*.md` | yes       | House tasks-file format; pure-helper unit-test convention (no RTL)                                                                                    | none      |

Precedence note: `package.json`'s `lint` script internally invokes `npx eslint`; project guidance says always run it via `yarn lint`. Not a conflict — the yarn script is the sanctioned entry point.

## Findings

### FLAG Findings

1. Manual-only verification of the layout permission gate and impersonation entry
   - Risk: `page-guard.test.ts` covers the helper, but the `READ_ADMIN_PORTAL` gate in the replaced `app/admin/layout.tsx` and the moved impersonation dialog's session behavior are verified only by manual click-through (task 2.9). A regression there locks admins out or breaks impersonation silently.
   - Suggested remediation: during task 2.9, explicitly test as a non-admin user (expect redirect) and run one impersonation cycle; record both in the proof screenshots. No file changes needed.

2. Two deletions slightly beyond spec text
   - Risk: tasks 2.5 and 5.4 delete replaced sidebar files and the orphaned `app/admin/weekends/upcoming/page.tsx` stub; the spec doesn't name them.
   - Suggested remediation: accepted as within the shell-replacement/rebuild intent (both verified zero-reference); noted here for transparency. No action unless the product owner objects.

## User-Approved Remediation Plan

- Not required — all REQUIRED gates pass; FLAG items carry suggested handling above.
