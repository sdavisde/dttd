# 18-spec-weekend-group-fees.md

## Introduction/Overview

Fees are not stored anywhere today. Every fee calculation reads two Stripe prices named by env vars
(`TEAM_FEE_PRICE_ID`, `CANDIDATE_FEE_PRICE_ID`), and outstanding fees are calculated only for the
**active** weekend group. When DTTD #13 was activated right after #12 finished, #12's 19 open fees
disappeared from the dashboard, the Payments ledger and the Weekends page, even though that money is
still owed.

This spec gives each weekend group its own stored fee: a team fee, a candidate fee and an online
surcharge. It then calculates outstanding fees for every group that has a fee set. A group with no fee
is "not tracked," which makes #12 the starting point without hardcoding it, and keeps each community's
pricing in its own data for the multitenant platform.

It ships in **two steps**:

- **Step 1** (Units 1–4): stored fees become the source of truth for what people owe, across every
  tracked group. Online checkout keeps charging the Stripe price.
- **Step 2** (Unit 5): checkout charges the group's stored price, and the Stripe price IDs are retired.

Step 2 is separate because it touches live payments. Step 1 is safe to ship alone, because the stored
prices for #12 and #13 match today's Stripe prices.

Design decisions were settled in a grilling session on 2026-09-24 and are treated as fixed inputs here.

## Goals

- Store team fee, candidate fee and online surcharge on each weekend group, so history can't be
  rewritten by a later price change
- Calculate outstanding fees across every group with a fee set, not just the active one, and restore
  #12's open fees
- Make "who owes" match community practice: candidates owe from approval, spiritual directors are
  exempt, dual-servers pay once per group, and dropped or rejected people owe nothing
- Surface money that doesn't match what's owed (fee decreases, double payments, payments from people
  who dropped) on a "Paid more than owed" list, so no payment silently falls out of view
- Gate fee changes behind a new `MANAGE_FEES` permission, and log every change with who, when, old
  value and new value
- (Step 2) Charge online payers the group's stored price, calculated on the server

## User Stories

- **As the treasurer**, I want outstanding fees from a weekend that just finished to stay visible after
  the next group is activated, so that I can keep collecting money for #12 through secuela.
- **As the treasurer**, I want to see who has paid more than they owe, so that I can decide on a
  refund, a reassignment or keeping it as a gift.
- **As a board member**, I want to set a group's weekend fee when it is created and confirm it when it
  is activated, so that everyone knows the price before payments start.
- **As a board member**, I want a clear warning of who is affected before I change a group's fee, and a
  record of the change afterward, so that a camp rate increase can be handled without surprises.
- **As a PWC**, I want candidates who haven't been approved to stay off the outstanding list, so that
  the number reflects money we have actually asked for.

## Settled Decisions (from grilling, 2026-09-24)

| Topic              | Decision                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit of pricing    | Per weekend group; Men's and Women's always share fees                                                                                                 |
| Stored fields      | `team_fee`, `candidate_fee`, `online_surcharge` on `weekend_groups`. The UI shows ONE "Weekend fee" input that sets both fees                          |
| Meaning of "fee"   | The **cash** price ($200 is "the real price"). Online price = fee + surcharge ($10 cushion for Stripe processing)                                      |
| Floor              | A null fee means the group isn't tracked. Backfill #12 and #13 with $200 / $200 / $10; older groups stay null                                          |
| Defaults           | Site settings holds the defaults for **new** groups only. A current group's fee is changed on the group                                                |
| Editing            | Editable anytime, even after activation, with a warning that lists who's affected, plus an audit log. Everyone owes the new amount (no grandfathering) |
| Permission         | New `MANAGE_FEES` (full access implies it). Creating a group at the default price needs no fee permission                                              |
| Exemptions         | Head Spiritual Director, Spiritual Director and Spiritual Director Trainee owe $0. A voluntary payment is recorded normally                            |
| Hardship           | Board-approved waiver (existing). Third-party payment already works (the payer is recorded separately from whose fee it covers)                        |
| Candidates         | Owe from approval: `awaiting_payment` and `confirmed` only                                                                                             |
| Dual-servers       | One team fee per group                                                                                                                                 |
| Drops / rejections | Owe $0. Anything they paid shows on "Paid more than owed". Treasurer voids or reassigns; refunds are deferred                                          |

## Demoable Units of Work

### Unit 1: Stored Fees, Backfill, Permission and Audit Trail

**Purpose:** Add the data every later unit reads. Nothing visible changes yet except the Security
page.

**Functional Requirements:**

- The system shall add nullable `team_fee`, `candidate_fee` and `online_surcharge` columns to
  `weekend_groups` (numeric dollars, `CHECK (>= 0)`), with column comments stating that `team_fee` and
  `candidate_fee` are the cash price and null means fees aren't tracked for the group
- The system shall enforce with a table constraint that the three columns are either all null or all
  set
- The migration shall backfill groups #12 and #13 with `team_fee = 200`, `candidate_fee = 200`,
  `online_surcharge = 10`, leave every other group null, and state those values in its header comment
  so they can be checked before it runs against prod
- The system shall add a `weekend_group_fee_changes` table (`id`, `group_id`, `changed_by`,
  `changed_at`, old and new values for all three fields), readable with `READ_PAYMENTS` and never
  updated or deleted. Rows are written by a trigger on `weekend_groups`, so no write path can skip
  the log (_as built: a trigger rather than an app-side insert; no `people_affected` count_)
- The trigger shall also enforce the fee permission: a new group at the site defaults needs no fee
  permission, while any other value, or any change after creation, needs `MANAGE_FEES`
- The system shall add `site_settings` keys `default_weekend_fee` (200) and `default_online_surcharge`
  (10), seeded by the migration
- The system shall add `Permission.MANAGE_FEES`, labelled "Set fee amounts" (distinct from the
  existing "Manage team fees" label on `READ_WRITE_TEAM_PAYMENTS`), as its own "Fee amounts" row on
  the Security page, with an implicit "Everyone can view" rung like Files. (_As built: the sensitive
  panel is reserved for candidate private data, so it didn't fit there._) Writes to the fee columns
  and the defaults require it (`auth_user_has_permission` already treats `FULL_ACCESS` as satisfying
  it)
- The system shall regenerate `database.types.ts`. Group fees are read through a separate
  `services/fees` module rather than added to `WeekendGroupWithId`, so fee reads stay independent of
  weekend reads

**Proof Artifacts:**

- Migration file: backfill values in the header, the all-or-nothing constraint and RLS policies are
  present
- Test: `permission-areas.test.ts` passes with `MANAGE_FEES` placed, proving the permission partition
  still holds
- Screenshot: the Security page shows the "Set fee amounts" switch

### Unit 2: Outstanding Fees Across Every Tracked Group

**Purpose:** Replace the active-group, Stripe-priced calculation with one that covers every tracked
group and follows the settled "who owes" rules. This is the fix for the missing #12 numbers.

**Functional Requirements:**

- The system shall change `getOutstandingFees` (`services/payment/payment-service.ts`) to take no
  weekend argument. It loads every group with a non-null fee, those groups' rosters and approved
  candidates, and prices each person from **their own group's** stored fee. It no longer calls Stripe
- The system shall count a candidate as owing only when their status is `awaiting_payment` or
  `confirmed` (`findCandidateFeeTargets` currently counts everyone who isn't `rejected`)
- The system shall treat a team member whose roster role (`cha_role`) is in a new
  `FEE_EXEMPT_CHA_ROLES` constant (the three spiritual director roles) as owing $0. The constant lives
  in `lib/payments/` with a comment that it moves to per-community role data in the tenancy epic
- The system shall keep dual-servers at one fee per group, listed under the Men's weekend, and key the
  one-fee-per-person rule by `(group, user)`, so the same person on #12 and #13 owes each group
- The system shall add one pure helper in `lib/payments/` that returns what a person owes, given their
  group's fees, target type, role and status. `deriveOutstandingFees`, the overpayment list (Unit 3) and
  the per-person payment summaries all use it
- The system shall switch the per-person payment summaries (`lib/payments/utils.ts`
  `getPaymentSummary`, used by `getWeekendRoster` in `services/weekend/weekend-service.ts` and by
  `actions/candidates.ts`) from "Stripe price, minus $10 if any manual payment" to the shared helper.
  `totalFee` is the group's cash fee, and the balance never shows below $0 (the surcharge is not a
  credit). A group with no fee shows no fee status
- The system shall drop the `activeWeekends` gate on the dashboard (`app/admin/page.tsx`) and the
  `'no-active-weekend'` state on the Payments page (`app/admin/payments/page.tsx`). The Weekends page
  (`app/admin/weekends/page.tsx`) keeps showing per-weekend counts from the same list
- The system shall switch `getActiveWeekendFinancials` (Payments → Summary) from Stripe prices to the
  active group's stored fees, and apply the same exemption and approval rules to its expected totals.
  When the active group has no fee, the summary says so instead of showing $0
- The system shall remove `FEE_LOOKUP_FAILED` from these paths. Where a failure state is still
  needed, the new one is "this group has no fee set"
- The outstanding ledger rows shall keep showing the weekend label (e.g. "DTTD #12 Men's"), so
  the treasurer can tell groups apart

**Proof Artifacts:**

- Test: `lib/payments/outstanding.test.ts` and the new helper's tests cover pricing per group, candidates
  counted only from approval, spiritual director exemption, dual-server listed once per group, the same
  person owing in two groups, dropped and rejected people excluded, and untracked groups skipped
- Test: a new co-located `lib/payments/utils.test.ts` covers the new summary behavior (online payer settled at $210
  with no credit, cash payer settled at $200, partial payments)
- Screenshot: with #13 active, the dashboard tile and the Payments ledger show #12's open fees again,
  labelled by weekend

### Unit 3: "Paid More Than Owed" List

**Purpose:** Make sure every dollar either covers a fee or is in front of the treasurer.

**Functional Requirements:**

- The system shall calculate overpayment per person in tracked groups with the shared helper. The
  threshold is the cash fee, plus the group's surcharge when any of that person's live payments was
  made online (a payment intent ID not starting with `manual_`). The surcharge is never overpayment
- The system shall include people who owe $0 but have live payments: dropped team members, rejected or
  not-yet-approved candidates, and exempt spiritual directors. A spiritual director's voluntary payment
  is labelled "Gift (exempt role)" rather than flagged for action
- The system shall show the list on the Payments page as a filter or section next to Outstanding
  (e.g. `?status=overpaid`), with person, weekend, amount owed, amount paid, amount over and reason
  (paid more than the fee / dropped / rejected / not yet approved / exempt role). Row actions link to
  the existing void and reassign dialogs
- The list shall follow the admin responsive rules (desktop table, mobile cards) via `DataTable`

**Proof Artifacts:**

- Test: overpayment derivation covers a fee decrease, a double payment, an online payer at exactly
  $210 (not flagged), a dropped member who paid, and a spiritual director's gift
- Screenshot: Payments page with the overpaid filter showing a sample row and its void/reassign actions

### Unit 4: Setting, Changing and Confirming Fees

**Purpose:** Give the board a place to set prices, and make fee changes visible and deliberate.

**Functional Requirements:**

- The system shall add one "Weekend fee" input (plus the surcharge, shown as "Card processing") to
  weekend group creation (`app/admin/weekends/components/WeekendSidebar.tsx`), pre-filled from the site
  defaults, with a live preview of "$200 cash / $210 online". Saving at the default values requires
  only the current create permission; saving different values requires `MANAGE_FEES`
- The system shall let `MANAGE_FEES` holders edit an existing group's fees. Before saving, a
  confirmation shows how many people in that group have paid, and what they will owe or how much they'll be
  overpaid under the new price. Every save is logged to `weekend_group_fee_changes` by the trigger
- The system shall show the group's price in the activation confirmation
  (`app/admin/weekends/components/SetActiveWeekendButton.tsx`), e.g. "Team and candidate fee: $200 cash /
  $210 online", and block activation of a group with no fee, with a link to set one
- The system shall replace the read-only Stripe fees card (`app/admin/settings/components/fees-card.tsx`)
  with an editable "Defaults for new weekend groups" card (weekend fee + card processing), editable with
  `MANAGE_FEES` and read-only otherwise, with the note "Changes apply to new weekend groups. To change a
  current group's fee, edit it on the group."
- The system shall show a group's fee history (from `weekend_group_fee_changes`) on the group, visible
  to `READ_PAYMENTS` holders
- **Step 1 safety guard:** until Unit 5 ships, the system shall add a dashboard system alert
  (`lib/admin/system-alerts.ts`) when the active group's online price (fee + surcharge) differs from the
  Stripe price checkout is still charging, so a fee change can't silently leave checkout charging the
  old amount

**Proof Artifacts:**

- Screenshot: create-group form with the pre-filled fee and cash/online preview
- Screenshot: fee-change confirmation listing affected payers, and the resulting history entry
- Screenshot: activation confirmation showing the price; a group with no fee can't be activated
- Screenshot: settings defaults card in edit and read-only states
- Test: the fee-change impact derivation (paid count, new balances, new overpayments) is unit-tested

### Unit 5 (Step 2): Checkout Charges the Group's Price

**Purpose:** Charge online payers from the stored price and retire the global Stripe price IDs. Shipped
and verified separately from Step 1.

**Functional Requirements:**

- The system shall change `beginCheckout` (`actions/checkout.ts`) to take the payment **target**
  (candidate or group member) instead of a client-supplied `priceId`. The server resolves the target's
  group, calculates `fee + surcharge`, and creates the session with an inline price (`price_data`) under
  the existing Stripe product for that fee type, so Stripe reports keep grouping payments the same way.
  The client can never supply an amount or price
- The system shall refuse to start checkout when the target's group has no fee, or the person owes
  nothing (exempt role, already settled), with a friendly message
- The system shall put `fee_type` (`team` | `candidate`) and `weekend_group_id` in the session metadata,
  and route the webhook (`services/stripe/handlers/checkout-session-completed.ts`) on `fee_type`. It
  keeps the existing `price_id` routing as a fallback so sessions created before the deploy still record
- The system shall show the group's online price on the payment pages (`app/(member)/payment/team-fee`,
  `app/(public)/payment/candidate-fee`) and the commitment form (`app/(member)/team-forms/commitment-form`)
  instead of the Stripe price
- The system shall remove the Step 1 mismatch alert, the `getTeamFee`/`getCandidateFee` price lookups
  and their callers, and replace `TEAM_FEE_PRICE_ID`/`CANDIDATE_FEE_PRICE_ID` with product-ID env vars
  (removed from env only after the fallback routing window, see Open Questions)

**Proof Artifacts:**

- Test: the checkout amount calculation (group fee + surcharge, refusal when untracked or settled) is
  unit-tested
- Test: webhook routing handles `fee_type` metadata and the legacy `price_id` fallback
- Screenshot / Stripe test-mode dashboard: a $210 team-fee session under the existing product, recorded
  in the ledger against the right person and weekend

## Non-Goals (Out of Scope)

- **Refunds.** Handled manually with void or reassign; a refund flow belongs to the payments epic
- **Credits carried between weekends**
- **Different team and candidate prices in the UI.** Stored separately, but one input sets both
- **Discounts or per-person prices** beyond role exemptions and existing waivers
- **Scholarship reporting** (how much the community covered from savings)
- **Per-community role data.** The exempt-role list is a code constant until the tenancy epic
- **Charging for groups before #12**

## Design Considerations

- One number, framed as the price: "Weekend fee $200", with "+ $10 card processing when paying online"
  as secondary text. Never present $210 as the fee
- Warnings on fee changes state consequences in people and dollars ("18 people have paid $200 and will
  each owe $25 more"), not abstractions
- New admin surfaces follow `docs/design-system.md`. Fee edits are an explicit save with a confirmation
  (an exception to auto-save, like the Edit payment dialog, because a save moves balances for a whole
  group)

## Repository Standards

- Server actions return `Result`; admin writes go through `authorizedAction` with `MANAGE_FEES`
- `toastError()` for user-facing failures; `isNil()` for null checks
- Pure derivations in `lib/payments/` with co-located `.test.ts` files; `yarn test`, `yarn lint`,
  `npx tsc --noEmit`
- Migrations in `supabase/migrations/`, then `yarn db:generate`

## Technical Considerations

- **Two fee models are unified.** Outstanding fees owe the cash price, while the per-person summaries
  currently owe the online price unless there's a manual payment. After Unit 2 both use one helper, so
  the roster, candidate list, review page and ledger can't disagree
- **Query shape:** outstanding fees now read rosters and candidates for every tracked group. Load
  them with one query per table filtered by the tracked groups' weekend IDs (`.in(...)`), not one query
  per weekend
- **Floor behavior is data:** a new community's first group gets a fee at creation and is tracked from
  day one. No code path mentions a group number
- **Rollout order:** Step 1's migration backfills values equal to the current Stripe prices, so nothing
  owed changes except the intended rule changes (#12 visible again, spiritual directors exempt,
  unapproved candidates dropped from the count). Unit 4's guard covers the window before Step 2

## Security Considerations

- Fee columns, the change log and the defaults are writable only with `MANAGE_FEES`, enforced by RLS
  as well as the server action
- `weekend_group_fee_changes` is insert-only; no policy permits update or delete
- Step 2 fixes an existing weakness: `beginCheckout` currently accepts whatever `priceId` the browser
  sends. The server will derive the amount from the target, so the browser has no say in the price

## Success Metrics

- With #13 active, the dashboard, Payments ledger and Weekends page show #12's outstanding fees and agree
  with each other
- Spiritual directors and unapproved candidates no longer appear as outstanding
- Every live payment in a tracked group is covering a fee, marked outstanding, or on "Paid more than owed"
- After Step 2, no code reads `TEAM_FEE_PRICE_ID` or `CANDIDATE_FEE_PRICE_ID`

## Open Questions

- How long to keep the webhook's `price_id` fallback after Step 2. Stripe checkout sessions expire after
  24 hours by default, so one release cycle is likely enough
- Whether the fee-history view belongs on the group's admin page or the Payments summary. Default: the
  group
