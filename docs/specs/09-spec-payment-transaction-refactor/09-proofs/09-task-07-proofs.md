# 09-task-07-proofs.md

## Task 7.0: Update Webhook Handlers

### CLI Output: yarn build

```
yarn run v1.22.22
$ next build
▲ Next.js 16.1.3 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 10.1s
  Running next.config.js provided runAfterProductionCompile ...
✓ Completed runAfterProductionCompile in 12859ms
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (42/42) in 399.0ms
  Finalizing page optimization ...
Done in 32.25s.
```

Build completed successfully with no TypeScript errors.

---

### Code Review: checkout-session-completed.ts

The handler now uses `PaymentService.recordPayment()` instead of direct database inserts:

```typescript
// Before: Direct insert to candidate_payments table
const { data: paymentRecord, error: paymentRecordError } = await adminClient
  .from('candidate_payments')
  .insert({
    candidate_id: candidateId,
    payment_amount: session.amount_total ? session.amount_total / 100 : null,
    // ... more fields
  })

// After: Uses PaymentService
const paymentResult = await PaymentService.recordPayment(
  {
    type: 'fee',
    target_type: 'candidate',
    target_id: candidateId,
    weekend_id: candidateInfo.weekend_id,
    payment_intent_id: paymentIntentId,
    gross_amount: grossAmount,
    // ... more fields
  },
  { dangerouslyBypassRLS: true }
)
```

Key changes:

- Imports `PaymentService` from `@/services/payment/payment-service`
- Removed `Tables` import as no longer needed
- Updated `candidateIsAwaitingPayment()` to return `weekend_id` for the payment record
- Removed `recordCandidatePayment()` helper function (replaced by service)
- Removed `recordWeekendRosterPayment()` helper function (replaced by service)
- Uses `{ dangerouslyBypassRLS: true }` for webhook context

---

### Code Review: charge-updated.ts

The handler now uses `PaymentService.backfillStripeData()` instead of direct database updates:

```typescript
// Before: Direct update to candidate_payments/weekend_roster_payments
const { error: updateError } = await adminClient
  .from('candidate_payments')
  .update({
    stripe_fee: feeData.stripeFee,
    net_amount: feeData.netAmount,
    charge_id: feeData.chargeId,
    balance_transaction_id: feeData.balanceTransactionId,
  })
  .eq('id', existingPayment.id)

// After: Uses PaymentService
const backfillResult = await PaymentService.backfillStripeData(
  paymentIntentId,
  {
    net_amount: feeData.netAmount,
    stripe_fee: feeData.stripeFee,
    charge_id: feeData.chargeId,
    balance_transaction_id: feeData.balanceTransactionId,
  },
  { dangerouslyBypassRLS: true }
)
```

Key changes:

- Imports `PaymentService` from `@/services/payment/payment-service`
- Removed `isOk`, `isNil` imports (no longer needed)
- Removed `WebhookHandlerContext`, `WebhookErrorCodes` from imports (unused)
- Removed `backfillCandidatePaymentFees()` helper function
- Removed `backfillTeamPaymentFees()` helper function
- Now queries unified `payment_transaction` table through service
- Uses `{ dangerouslyBypassRLS: true }` for webhook context

---

### Code Review: payout-paid.ts

The handler now uses `DepositService.recordStripePayoutDeposit()` and `PaymentService.backfillStripeData()`:

```typescript
// Before: Direct inserts to online_payment_payouts and online_payment_payout_transactions
const { data, error } = await adminClient
  .from('online_payment_payouts')
  .insert({
    payout_id: payout.id,
    amount: payout.amount,
    // ... more fields
  })

// After: Uses DepositService
const depositResult = await DepositService.recordStripePayoutDeposit(
  {
    payout_id: payout.id,
    amount: payout.amount / 100, // Convert from cents to dollars
    status: payout.status,
    arrival_date: arrivalDate,
    payment_intent_ids: paymentIntentIds,
  },
  { dangerouslyBypassRLS: true }
)
```

Key changes:

- Imports `DepositService` from `@/services/deposit/deposit-service`
- Imports `PaymentService` from `@/services/payment/payment-service`
- Removed `isNil` import (no longer needed)
- Removed `getTransactionData`, `PayoutTransaction` imports (no longer used)
- Removed `createPayoutRecord()` helper function
- Removed `createPayoutTransactionRecord()` helper function
- Removed `updateCandidatePaymentDeposit()` helper function
- Removed `updateTeamPaymentDeposit()` helper function
- Backfills fee data via `PaymentService.backfillStripeData()` before creating deposit
- Uses `{ dangerouslyBypassRLS: true }` for all service calls

---

### Verification: No Direct Database Writes to Old Tables

Search for old table references in webhook handlers:

```bash
$ grep -r "candidate_payments\|weekend_roster_payments\|online_payment_payouts\|online_payment_payout_transactions" services/stripe/handlers/
# (no results)
```

Search for `.from(` calls in handlers:

```bash
$ grep "\.from(" services/stripe/handlers/
services/stripe/handlers/index.ts:  return Array.from(handlers.keys())
services/stripe/handlers/checkout-session-completed.ts:    .from('candidates')
services/stripe/handlers/checkout-session-completed.ts:    .from('candidates')
services/stripe/handlers/checkout-session-completed.ts:    .from('weekend_roster')
```

The only remaining database operations are:

1. `Array.from()` - not a DB call
2. Querying `candidates` table for status validation
3. Updating `candidates.status` to 'confirmed'
4. Updating `weekend_roster.status` to 'paid'

These are all legitimate operations on non-payment tables.

---

### Summary of Changes

| File                            | Before                                                                                                                | After                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `checkout-session-completed.ts` | Direct inserts to `candidate_payments` and `weekend_roster_payments`                                                  | Uses `PaymentService.recordPayment()`                                                       |
| `charge-updated.ts`             | Direct updates to `candidate_payments` and `weekend_roster_payments`                                                  | Uses `PaymentService.backfillStripeData()`                                                  |
| `payout-paid.ts`                | Direct inserts to `online_payment_payouts` and `online_payment_payout_transactions`, direct updates to payment tables | Uses `DepositService.recordStripePayoutDeposit()` and `PaymentService.backfillStripeData()` |

All handlers now use `{ dangerouslyBypassRLS: true }` option as specified in the spec.
