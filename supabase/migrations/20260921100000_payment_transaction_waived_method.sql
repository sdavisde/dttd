-- Migration: allow 'waived' as a payment_transaction.payment_method
--
-- A waived fee is recorded as a ledger row like any other payment: it targets
-- the person whose fee is covered, for the fee amount, with the community as
-- the payer. It makes the fee read as covered but is never counted as money
-- collected (the application excludes method = 'waived' from collected totals).
--
-- payment_method is TEXT guarded by a CHECK constraint, so the only schema
-- change is widening that constraint. Nothing is dropped or rewritten, and
-- every existing row already satisfies the wider check. Safe to re-run.

DO $$
DECLARE
    existing_constraint RECORD;
BEGIN
    -- The original check was declared inline, so Postgres named it
    -- payment_transaction_payment_method_check. Look it up by definition as
    -- well, in case an environment ended up with a different name.
    FOR existing_constraint IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'payment_transaction'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%payment_method%'
    LOOP
        EXECUTE format(
            'ALTER TABLE public.payment_transaction DROP CONSTRAINT %I',
            existing_constraint.conname
        );
    END LOOP;
END $$;

ALTER TABLE public.payment_transaction
    ADD CONSTRAINT payment_transaction_payment_method_check
    CHECK (payment_method IN ('stripe', 'cash', 'check', 'waived'));

COMMENT ON COLUMN public.payment_transaction.payment_method IS
    'How payment was made: stripe, cash, check, or waived (fee covered by the community; not money collected)';
