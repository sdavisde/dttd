-- Add Stripe fee tracking and deposit marking columns to payment tables
-- This enables tracking of gross amount (what user paid), net amount (after Stripe fee),
-- and when funds were deposited to bank via Stripe payouts.

-- Add columns to candidate_payments table
ALTER TABLE "public"."candidate_payments"
ADD COLUMN IF NOT EXISTS "stripe_fee" NUMERIC,
ADD COLUMN IF NOT EXISTS "net_amount" NUMERIC,
ADD COLUMN IF NOT EXISTS "charge_id" TEXT,
ADD COLUMN IF NOT EXISTS "balance_transaction_id" TEXT,
ADD COLUMN IF NOT EXISTS "deposited_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "payout_id" TEXT;

-- Add columns to weekend_roster_payments table
ALTER TABLE "public"."weekend_roster_payments"
ADD COLUMN IF NOT EXISTS "stripe_fee" NUMERIC,
ADD COLUMN IF NOT EXISTS "net_amount" NUMERIC,
ADD COLUMN IF NOT EXISTS "charge_id" TEXT,
ADD COLUMN IF NOT EXISTS "balance_transaction_id" TEXT,
ADD COLUMN IF NOT EXISTS "deposited_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "payout_id" TEXT;

-- Add indexes for efficient payout matching
-- Index on payment_intent_id for candidate_payments (already has unique constraint, so index exists)
-- Index on charge_id for matching balance transactions to payments
CREATE INDEX IF NOT EXISTS "idx_candidate_payments_charge_id"
ON "public"."candidate_payments" ("charge_id");

CREATE INDEX IF NOT EXISTS "idx_weekend_roster_payments_charge_id"
ON "public"."weekend_roster_payments" ("charge_id");

-- Add comments for documentation
COMMENT ON COLUMN "public"."candidate_payments"."stripe_fee"
  IS 'Stripe processing fee in dollars (deducted from payment_amount)';
COMMENT ON COLUMN "public"."candidate_payments"."net_amount"
  IS 'Net amount after Stripe fee deduction (payment_amount - stripe_fee)';
COMMENT ON COLUMN "public"."candidate_payments"."charge_id"
  IS 'Stripe charge ID associated with this payment';
COMMENT ON COLUMN "public"."candidate_payments"."balance_transaction_id"
  IS 'Stripe balance transaction ID for fee tracking';
COMMENT ON COLUMN "public"."candidate_payments"."deposited_at"
  IS 'Timestamp when funds were deposited to bank via Stripe payout';
COMMENT ON COLUMN "public"."candidate_payments"."payout_id"
  IS 'Stripe payout ID when funds were deposited';

COMMENT ON COLUMN "public"."weekend_roster_payments"."stripe_fee"
  IS 'Stripe processing fee in dollars (deducted from payment_amount)';
COMMENT ON COLUMN "public"."weekend_roster_payments"."net_amount"
  IS 'Net amount after Stripe fee deduction (payment_amount - stripe_fee)';
COMMENT ON COLUMN "public"."weekend_roster_payments"."charge_id"
  IS 'Stripe charge ID associated with this payment';
COMMENT ON COLUMN "public"."weekend_roster_payments"."balance_transaction_id"
  IS 'Stripe balance transaction ID for fee tracking';
COMMENT ON COLUMN "public"."weekend_roster_payments"."deposited_at"
  IS 'Timestamp when funds were deposited to bank via Stripe payout';
COMMENT ON COLUMN "public"."weekend_roster_payments"."payout_id"
  IS 'Stripe payout ID when funds were deposited';
