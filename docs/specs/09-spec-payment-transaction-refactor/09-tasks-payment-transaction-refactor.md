# 09-tasks-payment-transaction-refactor.md

## Overview

This task list implements the payment transaction refactor as defined in `09-spec-payment-transaction-refactor.md`. The refactor consolidates `candidate_payments` and `weekend_roster_payments` into a single `payment_transaction` table, replaces payout tracking with a general deposits system, and updates the service layer to be the single source of truth for payment operations.

## Tasks

### [x] 1.0 Create Payment Transaction Table Schema

Create the new `payment_transaction` table that consolidates all payment records with a flexible schema supporting different payment types and targets.

#### 1.0 Proof Artifact(s)

- Migration file: `supabase/migrations/20260207200000_create_payment_transaction.sql` exists with correct schema
- CLI: `yarn db:generate` completes successfully without errors
- Database: Query `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payment_transaction'` returns all expected columns
- CLI: `psql` or Supabase Studio confirms table exists with correct indexes

#### 1.0 Tasks

- [x] 1.1 Create migration file with payment_transaction table DDL
  - id (UUID, primary key, default gen_random_uuid())
  - type (text, not null) - 'fee', 'donation', 'other'
  - target_type (text, nullable) - 'candidate', 'weekend_roster', null
  - target_id (UUID, nullable)
  - weekend_id (UUID, nullable, FK to weekends.id)
  - payment_intent_id (text, nullable)
  - gross_amount (numeric, not null)
  - net_amount (numeric, nullable)
  - stripe_fee (numeric, nullable)
  - payment_method (text, not null) - 'stripe', 'cash', 'check'
  - payment_owner (text, nullable)
  - notes (text, nullable)
  - charge_id (text, nullable)
  - balance_transaction_id (text, nullable)
  - created_at (timestamptz, default now())
- [x] 1.2 Add indexes on target_type, target_id, weekend_id, payment_intent_id, created_at
- [x] 1.3 Run yarn generate to regenerate TypeScript types
- [x] 1.4 Verify table and types are generated correctly

---

### [x] 2.0 Create Deposits Tables Schema

Create the `deposits` and `deposit_payments` tables to track when payments are deposited (both Stripe payouts and manual bank deposits).

#### 2.0 Proof Artifact(s)

- Migration file: `supabase/migrations/20260207200001_create_deposits_tables.sql` exists with correct schema
- CLI: `yarn db:generate` completes successfully without errors
- Database: Query confirms both `deposits` and `deposit_payments` tables exist with correct foreign key relationships
- CLI: Supabase Studio shows FK constraint from `deposit_payments.payment_transaction_id` to `payment_transaction.id`

#### 2.0 Tasks

- [x] 2.1 Create migration file with deposits table DDL
  - id (UUID, primary key, default gen_random_uuid())
  - deposit_type (text, not null) - 'stripe_payout', 'manual'
  - amount (numeric, not null)
  - status (text, not null) - 'pending', 'in_transit', 'paid', 'canceled', 'failed', 'completed'
  - arrival_date (timestamptz, nullable)
  - transaction_count (integer, not null, default 0)
  - payout_id (text, nullable, unique)
  - notes (text, nullable)
  - created_at (timestamptz, default now())
- [x] 2.2 Create deposit_payments join table in same migration
  - id (UUID, primary key, default gen_random_uuid())
  - deposit_id (UUID, not null, FK to deposits.id with CASCADE delete)
  - payment_transaction_id (UUID, not null, FK to payment_transaction.id)
  - created_at (timestamptz, default now())
  - Unique constraint on (deposit_id, payment_transaction_id)
- [x] 2.3 Add appropriate indexes on both tables
- [x] 2.4 Run yarn generate to regenerate TypeScript types
- [x] 2.5 Verify tables and FK relationships are correct

---

### [x] 3.0 Migrate Existing Payment Data

Migrate existing payment data from `candidate_payments` and `weekend_roster_payments` to `payment_transaction`, and from `online_payment_payouts`/`online_payment_payout_transactions` to `deposits`/`deposit_payments`.

#### 3.0 Proof Artifact(s)

- Migration file: `supabase/migrations/20260207200002_migrate_payment_data.sql` exists
- CLI: `yarn db:generate` completes successfully without errors
- Database: Record counts match between old and new tables (query before/after counts)
- Database: Spot-check sample records to verify data integrity (compare 3-5 records from each source table)
- Database: Old tables have deprecation comments added

#### 3.0 Tasks

- [x] 3.1 Create migration file for data migration
- [x] 3.2 Migrate candidate_payments to payment_transaction
  - type = 'fee'
  - target_type = 'candidate'
  - target_id = candidate_id
  - weekend_id = derived from candidate's weekend_id
  - gross_amount = payment_amount
  - payment_method = 'stripe' for 'card', otherwise preserve value
  - Map all Stripe-related fields (charge_id, balance_transaction_id, etc.)
- [x] 3.3 Migrate weekend_roster_payments to payment_transaction
  - type = 'fee'
  - target_type = 'weekend_roster'
  - target_id = weekend_roster_id
  - weekend_id = derived from weekend_roster's weekend_id
  - gross_amount = payment_amount
  - payment_method = 'stripe' for 'card', otherwise preserve value
  - Map all Stripe-related fields
- [x] 3.4 Migrate online_payment_payouts to deposits
  - deposit_type = 'stripe_payout'
  - amount = amount / 100 (convert cents to dollars)
  - Map status, arrival_date, payout_id, transaction_count
- [x] 3.5 Migrate online_payment_payout_transactions to deposit_payments
  - Link deposit_id to new deposits record via payout_id lookup
  - Link payment_transaction_id via payment_intent_id lookup
- [x] 3.6 Add deprecation comments to old tables
- [x] 3.7 Run yarn generate and verify data integrity

---

### [x] 4.0 Create Payment Repository with RLS Bypass

Create a repository layer for `payment_transaction` with a `dangerouslyBypassRLS` option for webhook usage, following the established service layer patterns.

#### 4.0 Proof Artifact(s)

- File: `/services/payment/repository.ts` exists with all specified CRUD functions
- File: Admin client helper function exists (in shared location or within repository)
- Code review: Repository follows patterns from `/services/CLAUDE.md` (types, repository, service separation)
- Code review: All functions accept `ServiceOptions` with `dangerouslyBypassRLS?: boolean`
- CLI: `yarn build` compiles without TypeScript errors

#### 4.0 Tasks

- [x] 4.1 Create ServiceOptions type with dangerouslyBypassRLS option in types.ts
- [x] 4.2 Create helper function to select appropriate Supabase client based on options
- [x] 4.3 Create createPayment(data, options) repository function
- [x] 4.4 Create getPaymentById(id, options) repository function
- [x] 4.5 Create getPaymentByPaymentIntentId(paymentIntentId, options) repository function
- [x] 4.6 Create getPaymentsByTargetId(targetType, targetId, options) repository function
- [x] 4.7 Create getAllPayments(options) repository function with joins for payer info
- [x] 4.8 Create updatePayment(id, data, options) repository function
- [x] 4.9 Verify all functions compile without TypeScript errors

---

### [x] 5.0 Create Payment Service Layer

Create the payment service that handles ALL business logic and validation, serving as the single source of truth for payment operations.

#### 5.0 Proof Artifact(s)

- File: `/services/payment/payment-service.ts` exists with all specified functions (`recordPayment`, `getPaymentForTarget`, `hasPaymentForTarget`, `getAllPayments`, `backfillStripeData`)
- Code review: All validation logic is in service layer, not repository
- Code review: Service uses Result pattern consistently (`ok()`, `err()`, `Results.unwrapOr()`)
- Code review: Service exposes `dangerouslyBypassRLS` option from repository
- CLI: `yarn build` compiles without TypeScript errors

#### 5.0 Tasks

- [x] 5.1 Create Zod validation schemas for payment input data in types.ts
- [x] 5.2 Create PaymentTransaction DTO types in types.ts
- [x] 5.3 Create recordPayment(data, options) service function with validation
- [x] 5.4 Create getPaymentForTarget(targetType, targetId, options) service function
- [x] 5.5 Create hasPaymentForTarget(targetType, targetId, options) service function
- [x] 5.6 Create getAllPayments(options) service function with normalized DTOs
- [x] 5.7 Create backfillStripeData(paymentIntentId, stripeData, options) service function
- [x] 5.8 Update index.ts with proper re-exports
- [x] 5.9 Run yarn build and verify compilation succeeds

---

### [x] 6.0 Create Deposit Repository and Service

Create repository and service layers for the deposits system with CRUD operations for `deposits` and `deposit_payments`.

#### 6.0 Proof Artifact(s)

- Files: `/services/deposit/repository.ts` and `/services/deposit/deposit-service.ts` exist
- File: `/services/deposit/types.ts` exists with DTOs and Zod schemas
- File: `/services/deposit/index.ts` exists with proper re-exports
- Code review: Service validates inputs and uses Result pattern
- Code review: Both repository and service support `dangerouslyBypassRLS` option
- CLI: `yarn build` compiles without TypeScript errors

#### 6.0 Tasks

- [x] 6.1 Create types.ts with database types, Zod schemas, and DTOs
  - Database types: DepositRow, DepositInsert, DepositUpdate, DepositPaymentRow, DepositPaymentInsert
  - Zod schemas: DepositTypeSchema ('stripe_payout', 'manual'), DepositStatusSchema ('pending', 'in_transit', 'paid', 'canceled', 'failed', 'completed'), CreateDepositSchema, UpdateDepositSchema, LinkPaymentSchema
  - Raw types: RawDepositWithPayments (deposit with linked payment transactions)
  - DTOs: DepositDTO (with computed payment_count), DepositPaymentDTO
- [x] 6.2 Create repository.ts with CRUD operations for deposits table
  - getClient(options) helper function for RLS bypass
  - createDeposit(data, options) - Insert and return single record
  - getDepositById(id, options) - Fetch by primary key with linked payments
  - getDepositByPayoutId(payoutId, options) - Fetch by Stripe payout ID
  - getAllDeposits(options) - Fetch all with linked payment count
  - updateDeposit(id, data, options) - Update by ID
  - updateDepositByPayoutId(payoutId, data, options) - Update by Stripe payout ID
- [x] 6.3 Create repository functions for deposit_payments join table
  - linkPaymentToDeposit(depositId, paymentTransactionId, options) - Create link
  - unlinkPaymentFromDeposit(depositId, paymentTransactionId, options) - Remove link
  - getPaymentsForDeposit(depositId, options) - Get all linked payment transactions
  - getDepositForPayment(paymentTransactionId, options) - Get deposit for a payment
- [x] 6.4 Create deposit-service.ts with business logic
  - normalizeDeposit(raw) - Convert raw deposit to DepositDTO
  - recordDeposit(data, options) - Create with validation
  - recordStripePayoutDeposit(payoutData, paymentIntentIds, options) - Create Stripe payout deposit and link payments
  - getDepositById(id, options) - Get normalized deposit
  - getAllDeposits(options) - Get all normalized deposits sorted by date
  - updateDepositStatus(id, status, options) - Update deposit status with validation
  - linkPaymentToDeposit(depositId, paymentTransactionId, options) - Link with validation
- [x] 6.5 Create actions.ts with authorized actions
  - getAllDeposits() - Requires READ_PAYMENTS permission
  - getDepositById(id) - Requires READ_PAYMENTS permission
- [x] 6.6 Create index.ts with proper re-exports
  - Export all types from types.ts
  - Export Zod schemas from types.ts
  - Export service functions for webhook usage (recordDeposit, recordStripePayoutDeposit, updateDepositStatus, linkPaymentToDeposit)
  - Re-export actions
- [x] 6.7 Run yarn build and verify compilation succeeds

---

### [ ] 7.0 Update Webhook Handlers

Update Stripe webhook handlers to use the new payment and deposit services instead of direct database writes.

#### 7.0 Proof Artifact(s)

- Files: `checkout-session-completed.ts`, `charge-updated.ts`, and `payout-paid.ts` updated to use services
- Code review: No direct database writes to payment tables in handlers (uses `PaymentService.recordPayment()`, `PaymentService.backfillStripeData()`, `DepositService.recordStripePayoutDeposit()`)
- Code review: Handlers use `dangerouslyBypassRLS: true` option
- CLI: `yarn build` compiles without TypeScript errors
- Manual test: Webhook handlers process test events successfully (via Stripe CLI or test environment)

#### 7.0 Tasks

TBD

---

### [ ] 8.0 Update Admin Payments Display

Update the admin payments page to work with the new unified payment schema.

#### 8.0 Proof Artifact(s)

- File: `/lib/payments/types.ts` updated with new `PaymentRecord` type matching new schema
- File: Payment service's `getAllPayments()` queries the new `payment_transaction` table
- File: `Payments.tsx` displays new fields (`type` as 'Fee'/'Donation'/'Other', `gross_amount`, `payment_method` as 'Stripe'/'Cash'/'Check')
- CLI: `yarn build` compiles without errors
- Screenshot: Admin payments page displays payments correctly with new field labels
- Manual test: Filtering and pagination work correctly on both desktop and mobile layouts

#### 8.0 Tasks

TBD
