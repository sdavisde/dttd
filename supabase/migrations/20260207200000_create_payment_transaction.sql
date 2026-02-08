-- Migration: Create payment_transaction table
-- Purpose: Consolidate candidate_payments and weekend_roster_payments into a single flexible table
-- Related to T1.0 in Spec 09

-- Create payment_transaction table
CREATE TABLE IF NOT EXISTS payment_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('fee', 'donation', 'other')),
    target_type TEXT CHECK (target_type IN ('candidate', 'weekend_roster') OR target_type IS NULL),
    target_id UUID,
    weekend_id UUID REFERENCES weekends(id),
    payment_intent_id TEXT,
    gross_amount NUMERIC NOT NULL CHECK (gross_amount > 0),
    net_amount NUMERIC,
    stripe_fee NUMERIC,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'cash', 'check')),
    payment_owner TEXT,
    notes TEXT,
    charge_id TEXT,
    balance_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payment_transaction_target_type ON payment_transaction(target_type);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_target_id ON payment_transaction(target_id);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_weekend_id ON payment_transaction(weekend_id);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_payment_intent_id ON payment_transaction(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_created_at ON payment_transaction(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_charge_id ON payment_transaction(charge_id);

-- Enable Row Level Security
ALTER TABLE payment_transaction ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated users full CRUD access
CREATE POLICY "Authenticated users can read payment_transaction"
ON payment_transaction FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert payment_transaction"
ON payment_transaction FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payment_transaction"
ON payment_transaction FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payment_transaction"
ON payment_transaction FOR DELETE
TO authenticated
USING (true);

-- Add table comment
COMMENT ON TABLE payment_transaction IS 'Unified payment records table consolidating candidate and team payments';
COMMENT ON COLUMN payment_transaction.type IS 'Payment type: fee, donation, or other';
COMMENT ON COLUMN payment_transaction.target_type IS 'Target entity type: candidate or weekend_roster. NULL for donations.';
COMMENT ON COLUMN payment_transaction.target_id IS 'UUID of the target entity (candidate or weekend_roster record)';
COMMENT ON COLUMN payment_transaction.gross_amount IS 'Total payment amount in dollars (not cents)';
COMMENT ON COLUMN payment_transaction.net_amount IS 'Amount after Stripe fees in dollars';
COMMENT ON COLUMN payment_transaction.payment_method IS 'How payment was made: stripe, cash, or check';
