-- Migration 6: Expand payment_transaction.target_type check constraint
-- to include 'weekend_group_member' as a valid target type.

ALTER TABLE payment_transaction
  DROP CONSTRAINT IF EXISTS payment_transaction_target_type_check;

ALTER TABLE payment_transaction
  ADD CONSTRAINT payment_transaction_target_type_check
  CHECK (target_type IN ('candidate', 'weekend_roster', 'weekend_group_member') OR target_type IS NULL);
