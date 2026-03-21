# Task 9.0 Proof Artifacts: Update Weekend Roster and Review Candidates Pages

## Overview

This task updated the weekend roster page and review candidates page to read payment data from the new `payment_transaction` table instead of the legacy `weekend_roster_payments` and `candidate_payments` tables.

## CLI Output

### Yarn Build Success

```bash
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
- Environments: .env.local
- Experiments (use with caution):
  · clientTraceMetadata

  Creating an optimized production build ...
✓ Compiled successfully in 10.3s
  Running next.config.js provided runAfterProductionCompile ...
✓ Completed runAfterProductionCompile in 12260ms
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (42/42) ...
✓ Generating static pages using 7 workers (42/42) in 433.0ms
  Finalizing page optimization ...

Done in 44.58s.
```

### Legacy Table Reference Count

```bash
$ grep -r "weekend_roster_payments\|candidate_payments" --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".next" | grep -v "database.types.ts" | grep -v "supabase/migrations" | grep -v "docs/specs" | wc -l
16
```

Remaining references are:

1. **Property names** on types (now populated from `payment_transaction`)
2. **Comment references** explaining the migration
3. **Type definitions** for backward compatibility with RawCandidate repository queries

## Files Modified

### Weekend Service Types

- **File**: `services/weekend/types.ts`
- **Changes**:
  - Added `PaymentRecord` type alias for `Tables<'payment_transaction'>`
  - Updated `RawWeekendRoster.payments` to use `PaymentRecord[]`
  - Updated `WeekendRosterMember.payment_info` to use `PaymentRecord | null`
  - Updated `WeekendRosterMember.all_payments` to use `PaymentRecord[]`

### Weekend Repository

- **File**: `services/weekend/repository.ts`
- **Changes**:
  - Removed `weekend_roster_payments` from `WeekendRosterQuery`
  - Added `RawWeekendRosterDB` type for DB records without payments
  - Marked `insertManualPayment()` as deprecated (replaced by PaymentService)
  - Payments are now fetched separately in service layer

### Weekend Service

- **File**: `services/weekend/weekend-service.ts`
- **Changes**:
  - Added import for `PaymentService` and `PaymentTransactionRow`
  - Updated `getWeekendRoster()` to fetch payments from `payment_transaction` table
  - Updated `normalizeRosterMember()` to use `gross_amount` instead of `payment_amount`
  - Updated `recordManualPayment()` to use `PaymentService.recordPayment()`

### Candidate Types

- **File**: `lib/candidates/types.ts`
- **Changes**:
  - Added `PaymentRecord` type alias for `Tables<'payment_transaction'>`
  - Updated `HydratedCandidate.candidate_payments` to use `PaymentRecord[]`
  - Marked `CandidatePayment` as deprecated

### Candidates Actions

- **File**: `actions/candidates.ts`
- **Changes**:
  - Updated `getAllCandidatesWithDetails()` to fetch payments from `payment_transaction`
  - Removed `candidate_payments(*)` from Supabase query
  - Fetches payments in parallel using `PaymentService.getPaymentForTarget()`

### Candidate Service

- **File**: `services/candidates/candidate-service.ts`
- **Changes**:
  - Added import for `PaymentService` and `PaymentTransactionRow`
  - Updated `recordManualCandidatePayment()` to use `PaymentService.recordPayment()`
  - Return type now `PaymentTransactionRow` instead of legacy table type

### Candidate Repository

- **File**: `services/candidates/repository.ts`
- **Changes**:
  - Marked `insertManualCandidatePayment()` as deprecated

### Payment Repository

- **File**: `services/payment/repository.ts`
- **Changes**:
  - Removed deprecated functions: `getAllTeamPayments()`, `getTeamPaymentByRosterId()`
  - Removed deprecated types: `RawTeamPayment`, `TeamPaymentQuery`

### Payment Service

- **File**: `services/payment/payment-service.ts`
- **Changes**:
  - Removed deprecated type imports and definitions

### UI Components Updated

- **File**: `app/(public)/review-candidates/components/CandidatePaymentInfo.tsx`
  - Updated to use `gross_amount` instead of `payment_amount`
- **File**: `app/(public)/review-candidates/components/CandidatePaymentInfoModal.tsx`
  - Updated to use `gross_amount`, `payment_method`, `notes` fields
  - Fixed `formatDate()` to handle nullable `created_at`
- **File**: `app/(public)/review-candidates/components/CandidateCashCheckPaymentModal.tsx`
  - Updated to use `gross_amount`
- **File**: `app/(public)/candidate-list/config/columns.ts`
  - Updated payment column accessor to use `gross_amount`
- **File**: `components/weekend/roster-view/payment-info-modal.tsx`
  - Updated to use `gross_amount` and handle nullable `created_at`

### Notification Service

- **File**: `services/notifications/notification-service.ts`
- **Changes**:
  - Added `HydratedCandidate` import
  - Excluded `candidate_payments` from raw candidate when building email template object

## Verification

### Type Safety

All changes compile successfully with TypeScript strict mode enabled.

### Data Flow

1. **Weekend Roster Page**: Payments fetched via `PaymentService.getPaymentForTarget('weekend_roster', rosterId)`
2. **Review Candidates Page**: Payments fetched via `PaymentService.getPaymentForTarget('candidate', candidateId)`
3. **Manual Payments**: Recorded via `PaymentService.recordPayment()` with proper `target_type` and `target_id`

### Backward Compatibility

- Property names on types (`candidate_payments`, `all_payments`) maintained for UI compatibility
- Data source changed from legacy tables to `payment_transaction`
- UI components updated to use new field names (`gross_amount` vs `payment_amount`)

## Bug Fix: Missing Payer Info on New Payments

After initial implementation, testing revealed that new `payment_transaction` records were missing `payment_owner` information. The following fixes were applied:

### Root Cause

1. **Manual team payments**: `recordManualPayment()` didn't accept or pass `payment_owner`
2. **Stripe team payments**: Checkout metadata didn't include `payment_owner`
3. **Stripe candidate payments**: `payment_owner` metadata contained category ("candidate"/"sponsor") instead of actual name

### Files Fixed

- **`services/weekend/weekend-service.ts`**
  - Added `paymentOwner` parameter to `recordManualPayment()`
  - Passes `payment_owner` to `PaymentService.recordPayment()`

- **`services/weekend/actions.ts`**
  - Updated action signature to include `paymentOwner` parameter

- **`components/weekend/roster-view/cash-check-payment-modal.tsx`**
  - Now passes `memberName` to `recordManualPayment()`

- **`app/(public)/payment/team-fee/page.tsx`**
  - Added `payment_owner` to checkout metadata with user's full name

- **`app/(public)/payment/candidate-fee/page.tsx`**
  - Changed `payment_owner` from category to actual payer name
  - Uses sponsor name if sponsor is paying, otherwise candidate name

- **`services/stripe/handlers/checkout-session-completed.ts`**
  - Team payment now uses `session.metadata?.payment_owner` instead of `null`

## Manual Verification Checklist

- [ ] Weekend roster page shows payment status correctly
- [ ] Review candidates page shows payment status correctly
- [ ] Manual payment recording works for team members (with payer name)
- [ ] Manual payment recording works for candidates (with payer name)
- [ ] Stripe payments capture payer name correctly
- [ ] Payment info modals display correct data
