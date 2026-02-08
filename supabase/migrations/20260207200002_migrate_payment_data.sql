-- Migration: Migrate existing payment data to new tables
-- Purpose: Copy data from legacy payment tables to payment_transaction and deposits tables
-- Related to T3.0 in Spec 09

-- Note: This migration preserves the old tables for reference but deprecates them

-- ============================================================================
-- STEP 1: Migrate candidate_payments to payment_transaction
-- ============================================================================
INSERT INTO payment_transaction (
    type,
    target_type,
    target_id,
    weekend_id,
    payment_intent_id,
    gross_amount,
    net_amount,
    stripe_fee,
    payment_method,
    payment_owner,
    notes,
    charge_id,
    balance_transaction_id,
    created_at
)
SELECT
    'fee'::TEXT,
    'candidate'::TEXT,
    cp.candidate_id,
    c.weekend_id,
    cp.payment_intent_id,
    COALESCE(cp.payment_amount, 0),
    cp.net_amount,
    cp.stripe_fee,
    CASE
        WHEN cp.payment_method = 'card' THEN 'stripe'
        WHEN cp.payment_method IN ('cash', 'check') THEN cp.payment_method
        ELSE 'stripe'  -- Default to stripe for any card-like values
    END,
    cp.payment_owner,
    cp.notes,
    cp.charge_id,
    cp.balance_transaction_id,
    cp.created_at
FROM candidate_payments cp
LEFT JOIN candidates c ON c.id = cp.candidate_id
WHERE cp.payment_amount > 0 OR cp.payment_amount IS NULL;  -- Handle nullable amounts

-- ============================================================================
-- STEP 2: Migrate weekend_roster_payments to payment_transaction
-- ============================================================================
INSERT INTO payment_transaction (
    type,
    target_type,
    target_id,
    weekend_id,
    payment_intent_id,
    gross_amount,
    net_amount,
    stripe_fee,
    payment_method,
    payment_owner,
    notes,
    charge_id,
    balance_transaction_id,
    created_at
)
SELECT
    'fee'::TEXT,
    'weekend_roster'::TEXT,
    wrp.weekend_roster_id,
    wr.weekend_id,
    wrp.payment_intent_id,
    COALESCE(wrp.payment_amount, 0),
    wrp.net_amount,
    wrp.stripe_fee,
    CASE
        WHEN wrp.payment_method = 'card' THEN 'stripe'
        WHEN wrp.payment_method IN ('cash', 'check') THEN wrp.payment_method
        ELSE 'stripe'  -- Default to stripe for any card-like values
    END,
    NULL,  -- payment_owner not tracked for team payments
    wrp.notes,
    wrp.charge_id,
    wrp.balance_transaction_id,
    wrp.created_at
FROM weekend_roster_payments wrp
LEFT JOIN weekend_roster wr ON wr.id = wrp.weekend_roster_id
WHERE wrp.payment_amount > 0 OR wrp.payment_amount IS NULL;

-- ============================================================================
-- STEP 3: Migrate online_payment_payouts to deposits
-- ============================================================================
INSERT INTO deposits (
    deposit_type,
    amount,
    status,
    arrival_date,
    transaction_count,
    payout_id,
    notes,
    created_at
)
SELECT
    'stripe_payout'::TEXT,
    opp.amount / 100.0,  -- Convert from cents to dollars
    opp.status,
    opp.arrival_date,
    COALESCE(opp.transaction_count, 0),
    opp.payout_id,
    NULL,  -- No notes in original table
    opp.created_at
FROM online_payment_payouts opp;

-- ============================================================================
-- STEP 4: Migrate online_payment_payout_transactions to deposit_payments
-- This links deposits to payment_transactions via payment_intent_id
-- ============================================================================
INSERT INTO deposit_payments (
    deposit_id,
    payment_transaction_id,
    created_at
)
SELECT DISTINCT
    d.id AS deposit_id,
    pt.id AS payment_transaction_id,
    oppt.created_at
FROM online_payment_payout_transactions oppt
JOIN online_payment_payouts opp ON opp.id = oppt.online_payment_payout_id
JOIN deposits d ON d.payout_id = opp.payout_id
JOIN payment_transaction pt ON pt.payment_intent_id = oppt.payment_intent_id
WHERE oppt.payment_intent_id IS NOT NULL
  AND pt.payment_intent_id IS NOT NULL;

-- ============================================================================
-- STEP 5: Add deprecation comments to old tables
-- ============================================================================
COMMENT ON TABLE candidate_payments IS
    'DEPRECATED: Use payment_transaction table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE weekend_roster_payments IS
    'DEPRECATED: Use payment_transaction table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE online_payment_payouts IS
    'DEPRECATED: Use deposits table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE online_payment_payout_transactions IS
    'DEPRECATED: Use deposit_payments table instead. This table is preserved for historical reference only.';
