-- Drop deprecated payment tables that have been replaced by payment_transaction,
-- deposits, and deposit_payments tables.
-- Data was migrated in 20260207200002_migrate_payment_data.sql.

-- Drop in FK-safe order: child table first
DROP TABLE IF EXISTS public.online_payment_payout_transactions;
DROP TABLE IF EXISTS public.online_payment_payouts;
DROP TABLE IF EXISTS public.weekend_roster_payments;
DROP TABLE IF EXISTS public.candidate_payments;
