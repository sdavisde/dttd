# 09-spec-payment-transaction-refactor.md

## Introduction/Overview

This specification defines a major refactor of the payment storage architecture. Currently, payments are stored in two separate tables (`candidate_payments` and `weekend_roster_payments`) with similar schemas. This refactor consolidates all payments into a single `payment_transaction` table with a flexible schema that supports different payment types (fees, donations) and targets (candidates, team members). Additionally, the payout tracking system is replaced with a more general `deposits` system that handles both Stripe payouts and manual bank deposits.

The payment service layer will be redesigned to serve as the single source of truth for all payment business logic, with a `dangerouslyBypassRLS` option to support webhook processing.

## Goals

- Consolidate `candidate_payments` and `weekend_roster_payments` into a single `payment_transaction` table
- Create a flexible schema that supports future payment types (donations) and targets
- Replace `online_payment_payouts` and `online_payment_payout_transactions` with a general `deposits` and `deposit_payments` system
- Refactor the payment service to handle ALL business logic and validation for payments
- Implement `dangerouslyBypassRLS` option in the payment service/repository for webhook usage
- Migrate existing payment data to the new schema while preserving old tables temporarily

## User Stories

- **As a developer**, I want a single payment table so that I don't have to write duplicate code for different payment types.
- **As a treasurer**, I want to see all payments (candidate fees, team fees, future donations) in one unified view so that I can manage finances more easily.
- **As a system administrator**, I want the payment service to be the single source of truth so that business logic is consistent across webhooks and user-initiated actions.
- **As a treasurer**, I want to track when manual payments (cash/check) are deposited at the bank so that I can reconcile our accounts.

## Demoable Units of Work

### Unit 1: Database Schema - Payment Transaction Table

**Purpose:** Create the new `payment_transaction` table that consolidates all payment records with a flexible schema.

**Functional Requirements:**

- The system shall create a `payment_transaction` table with the following columns:
  - `id` (UUID, primary key, default gen_random_uuid())
  - `type` (text, not null) - values: 'fee', 'donation', 'other'
  - `target_type` (text, nullable) - values: 'candidate', 'weekend_roster', null
  - `target_id` (UUID, nullable) - ID of the target entity based on target_type
  - `weekend_id` (UUID, nullable, FK to weekends.id)
  - `payment_intent_id` (text, nullable) - Stripe payment intent ID
  - `gross_amount` (numeric, not null) - total payment amount in dollars
  - `net_amount` (numeric, nullable) - amount after Stripe fees in dollars
  - `stripe_fee` (numeric, nullable) - Stripe fee in dollars
  - `payment_method` (text, not null) - values: 'stripe', 'cash', 'check'
  - `payment_owner` (text, nullable) - who paid (for candidates)
  - `notes` (text, nullable) - manual payment notes
  - `charge_id` (text, nullable) - Stripe charge ID
  - `balance_transaction_id` (text, nullable) - Stripe balance transaction ID
  - `created_at` (timestamptz, default now())
- The system shall create appropriate indexes on `target_type`, `target_id`, `weekend_id`, `payment_intent_id`, and `created_at`
- The system shall regenerate TypeScript types via `yarn generate`

**Proof Artifacts:**

- Migration file: `supabase/migrations/[timestamp]_create_payment_transaction.sql` exists with correct schema
- CLI: `yarn generate` completes successfully
- Database: Query confirms `payment_transaction` table exists with all columns

### Unit 2: Database Schema - Deposits Tables

**Purpose:** Create the `deposits` and `deposit_payments` tables to track when payments are deposited (both Stripe payouts and manual bank deposits).

**Functional Requirements:**

- The system shall create a `deposits` table with the following columns:
  - `id` (UUID, primary key, default gen_random_uuid())
  - `deposit_type` (text, not null) - values: 'stripe_payout', 'manual'
  - `amount` (numeric, not null) - total deposit amount in dollars
  - `status` (text, not null) - values: 'pending', 'in_transit', 'paid', 'canceled', 'failed', 'completed'
  - `arrival_date` (timestamptz, nullable) - when funds arrive(d)
  - `transaction_count` (integer, not null, default 0)
  - `payout_id` (text, nullable, unique) - Stripe payout ID (for stripe_payout type)
  - `notes` (text, nullable) - for manual deposits
  - `created_at` (timestamptz, default now())
- The system shall create a `deposit_payments` join table with the following columns:
  - `id` (UUID, primary key, default gen_random_uuid())
  - `deposit_id` (UUID, not null, FK to deposits.id)
  - `payment_transaction_id` (UUID, not null, FK to payment_transaction.id)
  - `created_at` (timestamptz, default now())
  - Unique constraint on (deposit_id, payment_transaction_id)
- The system shall regenerate TypeScript types via `yarn generate`

**Proof Artifacts:**

- Migration file: `supabase/migrations/[timestamp]_create_deposits_tables.sql` exists with correct schema
- CLI: `yarn generate` completes successfully
- Database: Query confirms both tables exist with correct foreign key relationships

### Unit 3: Data Migration

**Purpose:** Migrate existing payment data from `candidate_payments` and `weekend_roster_payments` to `payment_transaction`, and from `online_payment_payouts`/`online_payment_payout_transactions` to `deposits`/`deposit_payments`.

**Functional Requirements:**

- The system shall migrate all records from `candidate_payments` to `payment_transaction` with:
  - `type` = 'fee'
  - `target_type` = 'candidate'
  - `target_id` = candidate_id
  - `weekend_id` = derived from candidate's weekend association
  - `gross_amount` = payment_amount
  - `payment_method` = 'stripe' for 'card' payments, otherwise preserved
  - All Stripe-related fields mapped directly
- The system shall migrate all records from `weekend_roster_payments` to `payment_transaction` with:
  - `type` = 'fee'
  - `target_type` = 'weekend_roster'
  - `target_id` = weekend_roster_id
  - `weekend_id` = derived from weekend_roster's weekend association
  - `gross_amount` = payment_amount
  - `payment_method` = 'stripe' for 'card' payments, otherwise preserved
  - All Stripe-related fields mapped directly
- The system shall migrate all records from `online_payment_payouts` to `deposits` with:
  - `deposit_type` = 'stripe_payout'
  - `amount` = amount (converted from cents to dollars)
  - Other fields mapped directly
- The system shall migrate all records from `online_payment_payout_transactions` to `deposit_payments` with appropriate foreign key mappings
- The system shall add a deprecation comment to the old tables but NOT drop them (deferred to future migration)
- The system shall regenerate TypeScript types via `yarn generate`

**Proof Artifacts:**

- Migration file: `supabase/migrations/[timestamp]_migrate_payment_data.sql` exists
- Database: Record counts match between old and new tables
- Database: Spot-check sample records to verify data integrity

### Unit 4: Payment Repository with RLS Bypass

**Purpose:** Create a repository layer for `payment_transaction` with a `dangerouslyBypassRLS` option for webhook usage.

**Functional Requirements:**

- The system shall create `/services/payment/repository.ts` with CRUD operations for `payment_transaction`
- The repository shall accept a `ServiceOptions` type with `dangerouslyBypassRLS?: boolean`
- The repository shall use a helper function to create an admin Supabase client when `dangerouslyBypassRLS` is true
- The repository shall follow the existing service layer patterns from `/services/CLAUDE.md`
- The repository shall include the following functions:
  - `createPayment(data, options)` - insert a new payment transaction
  - `getPaymentById(id, options)` - get a single payment by ID
  - `getPaymentByPaymentIntentId(paymentIntentId, options)` - lookup by Stripe payment intent
  - `getPaymentsByTargetId(targetType, targetId, options)` - get payments for a specific target
  - `getAllPayments(options)` - get all payments (for admin view)
  - `updatePayment(id, data, options)` - update payment fields (for backfilling Stripe data)

**Proof Artifacts:**

- File: `/services/payment/repository.ts` exists with all specified functions
- File: Helper function for admin client creation exists
- Code review: Repository follows patterns from `/services/CLAUDE.md`

### Unit 5: Payment Service Layer

**Purpose:** Create the payment service that handles ALL business logic and validation, serving as the single source of truth for payment operations.

**Functional Requirements:**

- The system shall create `/services/payment/payment-service.ts` with business logic for all payment operations
- The service shall expose the `dangerouslyBypassRLS` option from the repository
- The service shall include the following functions:
  - `recordPayment(data, options)` - validate and create a payment (used by webhooks and manual entry)
  - `getPaymentForTarget(targetType, targetId, options)` - get payment(s) for a candidate or team member
  - `hasPaymentForTarget(targetType, targetId, options)` - check if payment exists
  - `getAllPayments(options)` - get all payments with normalized DTOs
  - `backfillStripeData(paymentIntentId, stripeData, options)` - update payment with Stripe fee data
- The service shall validate:
  - `type` is one of 'fee', 'donation', 'other'
  - `target_type` is null for donations, or 'candidate'/'weekend_roster' for fees
  - `payment_method` is one of 'stripe', 'cash', 'check'
  - `gross_amount` is positive
- The service shall use the Result pattern for error handling

**Proof Artifacts:**

- File: `/services/payment/payment-service.ts` exists with all specified functions
- Code review: All validation logic is in service layer, not repository
- Code review: Service uses Result pattern consistently

### Unit 6: Deposit Repository and Service

**Purpose:** Create repository and service layers for the deposits system.

**Functional Requirements:**

- The system shall create `/services/deposit/repository.ts` with CRUD operations for `deposits` and `deposit_payments`
- The system shall create `/services/deposit/deposit-service.ts` with business logic for deposits
- The service shall include the following functions:
  - `createDeposit(data, paymentIds, options)` - create a deposit and link payments
  - `getDepositById(id, options)` - get deposit with linked payments
  - `getDepositForPayment(paymentTransactionId, options)` - check if a payment has been deposited
  - `recordStripePayoutDeposit(payoutData, paymentIntentIds, options)` - handle Stripe payout.paid webhook
- Both repository and service shall support `dangerouslyBypassRLS` option
- The service shall validate:
  - `deposit_type` is one of 'stripe_payout', 'manual'
  - `status` is valid for the deposit type
  - All payment IDs exist before linking

**Proof Artifacts:**

- Files: `/services/deposit/repository.ts` and `/services/deposit/deposit-service.ts` exist
- Code review: Service validates inputs and uses Result pattern
- Code review: Both support `dangerouslyBypassRLS` option

### Unit 7: Update Webhook Handlers

**Purpose:** Update Stripe webhook handlers to use the new payment service instead of direct database writes.

**Functional Requirements:**

- The system shall update `checkout-session-completed.ts` to:
  - Use `PaymentService.recordPayment()` with `dangerouslyBypassRLS: true`
  - Pass correct `type`, `target_type`, `target_id`, and `weekend_id` values
  - Remove direct database inserts to old tables
- The system shall update `charge-updated.ts` to:
  - Use `PaymentService.backfillStripeData()` with `dangerouslyBypassRLS: true`
  - Query by `payment_intent_id` on the new table
- The system shall update `payout-paid.ts` to:
  - Use `DepositService.recordStripePayoutDeposit()` with `dangerouslyBypassRLS: true`
  - Create deposit and link all payments in the payout
- The system shall remove any direct usage of the admin Supabase client in webhook handlers for payment operations

**Proof Artifacts:**

- Files: All three webhook handlers updated to use services
- Code review: No direct database writes to payment tables in handlers
- Code review: Handlers use `dangerouslyBypassRLS: true` option

### Unit 8: Update Admin Payments Display

**Purpose:** Update the admin payments page to work with the new unified payment schema.

**Functional Requirements:**

- The system shall update `/lib/payments/types.ts` with the new `PaymentRecord` type matching the new schema
- The system shall update the payment service's `getAllPayments()` to query the new table
- The system shall update the `Payments.tsx` component to handle the new fields:
  - Display `type` as 'Fee', 'Donation', or 'Other'
  - Display `gross_amount` instead of `payment_amount`
  - Display `payment_method` as 'Stripe', 'Cash', or 'Check'
- The admin payments display shall continue to work with both desktop and mobile layouts

**Proof Artifacts:**

- CLI: `yarn build` completes without errors
- Screenshot: Admin payments page displays payments correctly with new field labels
- Manual test: Filtering and pagination work correctly

## Non-Goals (Out of Scope)

1. **Weekend Payments UI with deposit recording** - A separate spec will be created to implement the treasurer UI for recording manual deposits with the "+ Record Deposit" flow described in question 3.
2. **Dropping old tables** - Old payment tables will be deprecated but not dropped in this spec. A future migration will handle cleanup.
3. **Refund handling** - The refund workflow will be addressed in a future spec once the base payment system is stable.
4. **Historical reporting migration** - Any existing reports or dashboards that query old tables directly will need separate updates.
5. **RLS policies for new tables** - Row-level security policies will be added in a follow-up spec after the base implementation is complete.

## Design Considerations

No specific design requirements identified. The admin payments page already has desktop and mobile responsive layouts that will be preserved with the new field names.

## Repository Standards

Based on the codebase analysis:

- Follow the service layer architecture from `/services/CLAUDE.md`:
  - `types.ts` - DTOs, Raw types, Zod schemas
  - `repository.ts` - Database queries only
  - `{name}-service.ts` - Core logic, normalization, side effects
  - `actions.ts` - Auth/RBAC checks (if needed)
  - `index.ts` - Re-exports
- Use the Result pattern (`Result<Error, T>`) for all service and repository functions
- Use `fromSupabase()` helper for converting Supabase responses to Results
- Follow existing webhook handler patterns in `/services/stripe/handlers/`
- Use Pino logger for logging in service layer
- Migration files should be named with timestamp prefix and descriptive name

## Technical Considerations

- **Admin Client Helper**: Create a helper function (e.g., `createAdminClient()`) in a shared location that can be used by repositories when `dangerouslyBypassRLS` is true. This centralizes the admin client creation logic.
- **Amount Storage**: All amounts are stored in dollars (numeric), not cents. This matches the existing pattern.
- **UUID vs Integer IDs**: The new tables use UUID primary keys. Note that `candidate_payments` currently uses integer IDs - the migration must handle this conversion.
- **Foreign Key Strategy**: `target_id` is a UUID that references different tables based on `target_type`. This is a polymorphic relationship without database-level FK constraints.
- **Stripe Fee Timing**: Stripe fee data may not be available at checkout time. The `charge.updated` webhook backfills this data. The new service must handle nullable fee fields gracefully.

## Security Considerations

- **dangerouslyBypassRLS**: This option should ONLY be used by webhook handlers and system-level operations. The naming convention makes the risk explicit.
- **Service Role Key**: The admin client helper will use `SUPABASE_SERVICE_ROLE_KEY` environment variable. This key should never be exposed to client-side code.
- **Payment Data**: Payment records contain financial data but no direct PII beyond payment_owner (name of who paid). No credit card details are stored - those remain in Stripe.

## Success Metrics

1. **Data Integrity**: 100% of existing payment records successfully migrated with no data loss
2. **Webhook Processing**: All Stripe webhooks continue to process successfully using the new service layer
3. **Build Success**: `yarn build` passes with no TypeScript errors after all changes
4. **Admin Functionality**: Admin payments page displays all payment types correctly

## Open Questions

1. Should we add a `currency` field to `payment_transaction` for future international support, or default to USD?
2. For the `weekend_id` derivation during migration, how should we handle candidates/roster records that have no associated weekend?
