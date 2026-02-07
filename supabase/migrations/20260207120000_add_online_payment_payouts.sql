-- Create tables for tracking Stripe payouts and their transactions
-- This provides an audit trail and allows matching transactions to payments later

-- Table for payout-level information
CREATE TABLE IF NOT EXISTS "public"."online_payment_payouts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "payout_id" TEXT UNIQUE NOT NULL,           -- Stripe payout ID (po_xxx)
  "amount" INTEGER NOT NULL,                   -- Total payout amount in cents
  "currency" TEXT DEFAULT 'usd',
  "status" TEXT NOT NULL,                      -- 'paid', 'pending', 'in_transit', 'canceled', 'failed'
  "arrival_date" TIMESTAMPTZ,                  -- When Stripe expects/expected the deposit
  "transaction_count" INTEGER,                 -- Number of transactions in this payout
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Table for individual transactions within each payout
CREATE TABLE IF NOT EXISTS "public"."online_payment_payout_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "online_payment_payout_id" UUID NOT NULL REFERENCES "public"."online_payment_payouts"("id") ON DELETE CASCADE,
  "payment_intent_id" TEXT,                    -- Stripe payment intent ID (pi_xxx)
  "charge_id" TEXT,                            -- Stripe charge ID (ch_xxx)
  "balance_transaction_id" TEXT UNIQUE,        -- Stripe balance transaction ID (txn_xxx)
  "gross_amount" INTEGER,                      -- Gross amount in cents
  "stripe_fee" INTEGER,                        -- Stripe fee in cents
  "net_amount" INTEGER,                        -- Net amount in cents
  -- Optional FK links to our payment records (set when matched)
  -- Note: candidate_payments.id is INTEGER, weekend_roster_payments.id is UUID
  "candidate_payment_id" INTEGER REFERENCES "public"."candidate_payments"("id") ON DELETE SET NULL,
  "weekend_roster_payment_id" UUID REFERENCES "public"."weekend_roster_payments"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_online_payment_payouts_payout_id"
ON "public"."online_payment_payouts" ("payout_id");

CREATE INDEX IF NOT EXISTS "idx_online_payment_payouts_arrival_date"
ON "public"."online_payment_payouts" ("arrival_date");

CREATE INDEX IF NOT EXISTS "idx_online_payment_payout_transactions_payout_id"
ON "public"."online_payment_payout_transactions" ("online_payment_payout_id");

CREATE INDEX IF NOT EXISTS "idx_online_payment_payout_transactions_payment_intent_id"
ON "public"."online_payment_payout_transactions" ("payment_intent_id");

CREATE INDEX IF NOT EXISTS "idx_online_payment_payout_transactions_candidate_payment_id"
ON "public"."online_payment_payout_transactions" ("candidate_payment_id");

CREATE INDEX IF NOT EXISTS "idx_online_payment_payout_transactions_weekend_roster_payment_id"
ON "public"."online_payment_payout_transactions" ("weekend_roster_payment_id");

-- Enable RLS (webhooks use admin client which bypasses RLS, but good practice)
ALTER TABLE "public"."online_payment_payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."online_payment_payout_transactions" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read payout data (for admin reporting)
CREATE POLICY "Allow authenticated users to read payouts"
ON "public"."online_payment_payouts"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read payout transactions"
ON "public"."online_payment_payout_transactions"
FOR SELECT
TO authenticated
USING (true);

-- Comments for documentation
COMMENT ON TABLE "public"."online_payment_payouts"
  IS 'Tracks Stripe payouts (deposits to bank account) for audit and reconciliation';

COMMENT ON TABLE "public"."online_payment_payout_transactions"
  IS 'Individual transactions included in each Stripe payout, linked to our payment records';

COMMENT ON COLUMN "public"."online_payment_payouts"."payout_id"
  IS 'Stripe payout ID (e.g., po_xxx)';
COMMENT ON COLUMN "public"."online_payment_payouts"."amount"
  IS 'Total payout amount in cents';
COMMENT ON COLUMN "public"."online_payment_payouts"."status"
  IS 'Payout status from Stripe: paid, pending, in_transit, canceled, failed';
COMMENT ON COLUMN "public"."online_payment_payouts"."arrival_date"
  IS 'Expected or actual arrival date of funds in bank account';

COMMENT ON COLUMN "public"."online_payment_payout_transactions"."payment_intent_id"
  IS 'Stripe payment intent ID for matching to our payment records';
COMMENT ON COLUMN "public"."online_payment_payout_transactions"."candidate_payment_id"
  IS 'Link to candidate_payments if this transaction matched a candidate payment';
COMMENT ON COLUMN "public"."online_payment_payout_transactions"."weekend_roster_payment_id"
  IS 'Link to weekend_roster_payments if this transaction matched a team payment';
