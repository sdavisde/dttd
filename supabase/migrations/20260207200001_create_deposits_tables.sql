-- Migration: Create deposits and deposit_payments tables
-- Purpose: Replace online_payment_payouts with a more general deposits system
-- Related to T2.0 in Spec 09

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_type TEXT NOT NULL CHECK (deposit_type IN ('stripe_payout', 'manual')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'paid', 'canceled', 'failed', 'completed')),
    arrival_date TIMESTAMPTZ,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    payout_id TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deposit_payments join table
CREATE TABLE IF NOT EXISTS deposit_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
    payment_transaction_id UUID NOT NULL REFERENCES payment_transaction(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deposit_id, payment_transaction_id)
);

-- Create indexes for deposits table
CREATE INDEX IF NOT EXISTS idx_deposits_deposit_type ON deposits(deposit_type);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_payout_id ON deposits(payout_id);
CREATE INDEX IF NOT EXISTS idx_deposits_arrival_date ON deposits(arrival_date);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at);

-- Create indexes for deposit_payments table
CREATE INDEX IF NOT EXISTS idx_deposit_payments_deposit_id ON deposit_payments(deposit_id);
CREATE INDEX IF NOT EXISTS idx_deposit_payments_payment_transaction_id ON deposit_payments(payment_transaction_id);

-- Enable Row Level Security
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deposits: Allow authenticated users full CRUD access
CREATE POLICY "Authenticated users can read deposits"
ON deposits FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert deposits"
ON deposits FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update deposits"
ON deposits FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deposits"
ON deposits FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for deposit_payments: Allow authenticated users full CRUD access
CREATE POLICY "Authenticated users can read deposit_payments"
ON deposit_payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert deposit_payments"
ON deposit_payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update deposit_payments"
ON deposit_payments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deposit_payments"
ON deposit_payments FOR DELETE
TO authenticated
USING (true);

-- Add table comments
COMMENT ON TABLE deposits IS 'Tracks when payments are deposited to bank (Stripe payouts or manual deposits)';
COMMENT ON COLUMN deposits.deposit_type IS 'Type of deposit: stripe_payout or manual bank deposit';
COMMENT ON COLUMN deposits.amount IS 'Total deposit amount in dollars';
COMMENT ON COLUMN deposits.status IS 'Deposit status: pending, in_transit, paid, canceled, failed, completed';
COMMENT ON COLUMN deposits.payout_id IS 'Stripe payout ID (for stripe_payout type only)';

COMMENT ON TABLE deposit_payments IS 'Join table linking deposits to their constituent payment transactions';
