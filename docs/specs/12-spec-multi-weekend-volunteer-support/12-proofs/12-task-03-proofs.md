# Task 3.0 — Payment Rework Proof Artifacts

## CLI Output

### yarn db:reset (Migration 3.1 validated)

```
Applying migration 20260308000005_payment_intent_unique_index.sql...
Finished supabase db reset on branch main.
```

All 18 migrations applied in sequence with zero errors.

### yarn build (Task 3.11 — zero TypeScript errors)

```
✓ Compiled successfully in 8.6s
✓ Generating static pages using 7 workers (42/42) in 410.6ms
Done in 22.49s.
```

No TypeScript errors after `yarn db:generate` and all code changes.

---

## Changes by Sub-task

### 3.1 — Migration: payment_intent unique index

**File:** `supabase/migrations/20260308000005_payment_intent_unique_index.sql`

```sql
CREATE UNIQUE INDEX payment_transaction_payment_intent_id_key
  ON payment_transaction(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;
```

Prevents duplicate payment records for the same Stripe payment intent.

### 3.2 — TargetTypeSchema updated

**File:** `services/payment/types.ts`

`TargetTypeSchema` now includes `'weekend_group_member'` in the enum alongside `'candidate'` and `'weekend_roster'`.

### 3.3 — Weekend number restored via weekend_groups join

**Files:** `lib/weekend/types.ts`, `services/weekend/repository.ts`, `services/weekend/weekend-service.ts`

- `RawWeekendRecord` extended with `weekend_groups: { number: number | null } | null`
- All weekend select queries updated to include `*, weekend_groups(number)`:
  - `findActiveWeekends`
  - `findWeekendsByGroupId`
  - `findWeekendsByStatuses`
  - `findWeekendById`
  - `insertWeekendGroup`
  - `updateWeekendByGroupAndType`
- `normalizeWeekend` now reads `number: weekend.weekend_groups?.number ?? null`
- `getWeekendById` now calls `normalizeWeekend` instead of returning raw data directly

### 3.4 — Admin weekend page breadcrumb

**File:** `app/admin/weekends/[weekend_id]/page.tsx`

Breadcrumb label now derives from `weekend_groups.number` via the normalized weekend:

```
"Group 47 — Men's"   (when title is null and number is available)
```

Falls back to the weekend `title` field if set, or `"{TYPE} Weekend"` if no number.

### 3.5 — getActiveGroupMemberForUser

**File:** `services/weekend-group-member/repository.ts`

New function queries `weekends` for ACTIVE group_id, then finds the `weekend_group_members` row for that group and the given user. Returns `null` if user is not on the active group roster.

### 3.6 — Team fee payment page

**File:** `app/(public)/payment/team-fee/page.tsx`

- Removed `weekend_id` searchParam requirement
- Uses `getActiveGroupMemberForUser(user.id)` to find the group member
- Passes `{ group_member_id: groupMemberId, payment_owner: payerName }` as Stripe checkout metadata
- Shows existing "not on roster" alert if no active group member found

### 3.7 — getGroupMemberById

**File:** `services/weekend-group-member/repository.ts`

New function fetches a `weekend_group_members` row by ID using the admin client (bypasses RLS for webhook use). Also fetches a representative `weekend_id` from the group for notification purposes.

### 3.8 — handleTeamPayment webhook handler

**File:** `services/stripe/handlers/checkout-session-completed.ts`

- Reads `group_member_id` from `session.metadata` instead of `user_id + weekend_id`
- Validates `group_member_id` is non-null; returns webhook error if missing
- Calls `getGroupMemberById(groupMemberId)` to verify the group member exists
- Records payment with `target_type: 'weekend_group_member'`, `target_id: groupMemberId`
- Removed calls to `getWeekendRosterRecord` and `markTeamMemberAsPaid`
- `notifyAssistantHeadForTeamPayment` called with `user_id` + `weekendId` derived from group member
- `markTeamMemberAsPaid` function deleted entirely

### 3.9 — hasTeamPayment

**File:** `services/payment/actions.ts`

`hasTeamPayment(groupMemberId)` now calls `hasPaymentForTarget('weekend_group_member', groupMemberId)` instead of `'weekend_roster'`.

### 3.10 — recordManualPayment

**Files:** `services/weekend/weekend-service.ts`, `services/weekend/actions.ts`

- Service `recordManualPayment` now accepts `groupMemberId` and targets `weekend_group_member`
- Action layer bridges from `weekendRosterId` → `groupMemberId` via `getGroupMemberByRosterId`
- Admin UI (`cash-check-payment-modal.tsx`) unchanged — still passes `rosterMember.id`
