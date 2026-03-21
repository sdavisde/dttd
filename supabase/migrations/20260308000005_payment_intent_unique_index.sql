-- Migration 5: Add unique partial index on payment_transaction(payment_intent_id)
-- This prevents duplicate payment records for the same Stripe payment intent.

CREATE UNIQUE INDEX payment_transaction_payment_intent_id_key
  ON payment_transaction(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;
