-- Migration: Support correcting payment_transaction records
-- Purpose: A payment recorded against the wrong candidate (or with the wrong
-- amount) previously had no fix short of a manual UPDATE. This adds the
-- columns needed to reassign, edit, and void payments with an audit trail,
-- and restricts those writes to holders of WRITE_PAYMENTS.

-- ---------------------------------------------------------------------------
-- Audit + void columns
-- ---------------------------------------------------------------------------

ALTER TABLE payment_transaction
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS void_reason TEXT;

COMMENT ON COLUMN payment_transaction.updated_at IS 'When this payment was last corrected (reassigned or edited). NULL if never corrected.';
COMMENT ON COLUMN payment_transaction.updated_by IS 'User who last corrected this payment.';
COMMENT ON COLUMN payment_transaction.voided_at IS 'When this payment was voided. Voided payments are excluded from balances and totals but are never deleted.';
COMMENT ON COLUMN payment_transaction.voided_by IS 'User who voided this payment.';
COMMENT ON COLUMN payment_transaction.void_reason IS 'Why this payment was voided (bounced check, duplicate entry, etc).';

-- Balance and total queries all filter on `voided_at IS NULL`, so index the
-- live rows rather than the whole column.
CREATE INDEX IF NOT EXISTS idx_payment_transaction_live
  ON payment_transaction(target_type, target_id)
  WHERE voided_at IS NULL;

-- ---------------------------------------------------------------------------
-- Permission helper
-- ---------------------------------------------------------------------------

-- Mirrors userHasPermission() in lib/security.ts: FULL_ACCESS satisfies any
-- permission check. SECURITY DEFINER so the policy can read user_roles/roles
-- regardless of the caller's own access to those tables.
CREATE OR REPLACE FUNCTION public.auth_user_has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND (
        'FULL_ACCESS' = ANY(r.permissions)
        OR required_permission = ANY(r.permissions)
      )
  );
$$;

COMMENT ON FUNCTION public.auth_user_has_permission(TEXT) IS 'True when the calling user holds the given permission, or FULL_ACCESS. Mirrors userHasPermission() in lib/security.ts.';

-- ---------------------------------------------------------------------------
-- Restrict payment writes to WRITE_PAYMENTS holders
-- ---------------------------------------------------------------------------

-- Previously any authenticated user could update or delete any payment row.
-- Recording a payment stays open (it only adds); changing or removing an
-- existing money record now requires the permission.
DROP POLICY IF EXISTS "Authenticated users can update payment_transaction" ON payment_transaction;
DROP POLICY IF EXISTS "Authenticated users can delete payment_transaction" ON payment_transaction;

CREATE POLICY "Users with WRITE_PAYMENTS can update payment_transaction"
ON payment_transaction FOR UPDATE
TO authenticated
USING (public.auth_user_has_permission('WRITE_PAYMENTS'))
WITH CHECK (public.auth_user_has_permission('WRITE_PAYMENTS'));

CREATE POLICY "Users with WRITE_PAYMENTS can delete payment_transaction"
ON payment_transaction FOR DELETE
TO authenticated
USING (public.auth_user_has_permission('WRITE_PAYMENTS'));
