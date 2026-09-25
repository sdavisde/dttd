-- Migration: Store fees on each weekend group
-- Purpose: Fees used to live only in Stripe (two global price IDs), so every
-- balance was priced at today's Stripe price and only the active group was
-- ever checked. Each group now carries its own price, which keeps history
-- fixed and lets outstanding fees cover every group that has one.
--
-- Backfill (confirm before running against prod):
--   DTTD #12 and #13 -> team_fee = 200, candidate_fee = 200, online_surcharge = 10
--   Every other group stays NULL ("fees not tracked"), which is what makes
--   #12 the first group outstanding fees are calculated for.
--
-- See docs/specs/18-spec-weekend-group-fees.

-- ---------------------------------------------------------------------------
-- Fee columns
-- ---------------------------------------------------------------------------

ALTER TABLE weekend_groups
  ADD COLUMN IF NOT EXISTS team_fee NUMERIC(10, 2) CHECK (team_fee >= 0),
  ADD COLUMN IF NOT EXISTS candidate_fee NUMERIC(10, 2) CHECK (candidate_fee >= 0),
  ADD COLUMN IF NOT EXISTS online_surcharge NUMERIC(10, 2) CHECK (online_surcharge >= 0);

ALTER TABLE weekend_groups
  ADD CONSTRAINT weekend_groups_fees_all_or_none CHECK (
    (team_fee IS NULL AND candidate_fee IS NULL AND online_surcharge IS NULL)
    OR (team_fee IS NOT NULL AND candidate_fee IS NOT NULL AND online_surcharge IS NOT NULL)
  );

COMMENT ON COLUMN weekend_groups.team_fee IS 'Team fee in dollars, at the cash price. NULL means fees are not tracked for this group.';
COMMENT ON COLUMN weekend_groups.candidate_fee IS 'Candidate fee in dollars, at the cash price. NULL means fees are not tracked for this group.';
COMMENT ON COLUMN weekend_groups.online_surcharge IS 'Dollars added on top of the fee when paying online, to cover card processing.';

UPDATE weekend_groups
SET team_fee = 200, candidate_fee = 200, online_surcharge = 10
WHERE number IN (12, 13);

-- ---------------------------------------------------------------------------
-- Defaults for new groups
-- ---------------------------------------------------------------------------

INSERT INTO site_settings (key, value) VALUES
  ('default_weekend_fee', '200'),
  ('default_online_surcharge', '10')
ON CONFLICT (key) DO NOTHING;

-- Only MANAGE_FEES holders may change the defaults. Restrictive policies are
-- ANDed with the existing permissive ones, so other settings keep today's
-- rules.
CREATE POLICY "Fee defaults require MANAGE_FEES to insert"
  ON site_settings AS RESTRICTIVE FOR INSERT
  TO authenticated
  WITH CHECK (
    key NOT IN ('default_weekend_fee', 'default_online_surcharge')
    OR public.auth_user_has_permission('MANAGE_FEES')
  );

CREATE POLICY "Fee defaults require MANAGE_FEES to update"
  ON site_settings AS RESTRICTIVE FOR UPDATE
  TO authenticated
  USING (
    key NOT IN ('default_weekend_fee', 'default_online_surcharge')
    OR public.auth_user_has_permission('MANAGE_FEES')
  )
  WITH CHECK (
    key NOT IN ('default_weekend_fee', 'default_online_surcharge')
    OR public.auth_user_has_permission('MANAGE_FEES')
  );

-- ---------------------------------------------------------------------------
-- Change log
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS weekend_group_fee_changes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES weekend_groups(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_team_fee NUMERIC(10, 2),
  new_team_fee NUMERIC(10, 2),
  old_candidate_fee NUMERIC(10, 2),
  new_candidate_fee NUMERIC(10, 2),
  old_online_surcharge NUMERIC(10, 2),
  new_online_surcharge NUMERIC(10, 2)
);

COMMENT ON TABLE weekend_group_fee_changes IS 'Every change to a weekend group''s fees, written by trigger. Never updated or deleted.';

CREATE INDEX IF NOT EXISTS idx_weekend_group_fee_changes_group
  ON weekend_group_fee_changes(group_id, changed_at DESC);

ALTER TABLE weekend_group_fee_changes ENABLE ROW LEVEL SECURITY;

-- Readable by anyone who can see payments. There are no insert, update or
-- delete policies: rows are written only by the trigger below.
CREATE POLICY "Users with READ_PAYMENTS can read fee changes"
  ON weekend_group_fee_changes FOR SELECT
  TO authenticated
  USING (public.auth_user_has_permission('READ_PAYMENTS'));

-- ---------------------------------------------------------------------------
-- Guard + log trigger
-- ---------------------------------------------------------------------------

-- weekend_groups is writable by any authenticated user (app-level checks), so
-- fee changes are guarded here. A group created at the site defaults needs no
-- fee permission; any other fee value, or any change after creation, needs
-- MANAGE_FEES. Service-role writes (no auth.uid()) are trusted.
CREATE OR REPLACE FUNCTION public.guard_and_log_weekend_group_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_fee NUMERIC;
  default_surcharge NUMERIC;
  at_defaults BOOLEAN;
BEGIN
  IF TG_OP = 'UPDATE'
    AND NEW.team_fee IS NOT DISTINCT FROM OLD.team_fee
    AND NEW.candidate_fee IS NOT DISTINCT FROM OLD.candidate_fee
    AND NEW.online_surcharge IS NOT DISTINCT FROM OLD.online_surcharge THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.team_fee IS NULL THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL AND NOT public.auth_user_has_permission('MANAGE_FEES') THEN
    SELECT value::NUMERIC INTO default_fee FROM site_settings WHERE key = 'default_weekend_fee';
    SELECT value::NUMERIC INTO default_surcharge FROM site_settings WHERE key = 'default_online_surcharge';
    at_defaults := TG_OP = 'INSERT'
      AND NEW.team_fee = default_fee
      AND NEW.candidate_fee = default_fee
      AND NEW.online_surcharge = default_surcharge;
    IF NOT at_defaults THEN
      RAISE EXCEPTION 'Changing weekend fees requires the MANAGE_FEES permission'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  INSERT INTO weekend_group_fee_changes (
    group_id, changed_by,
    old_team_fee, new_team_fee,
    old_candidate_fee, new_candidate_fee,
    old_online_surcharge, new_online_surcharge
  ) VALUES (
    NEW.id, auth.uid(),
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.team_fee END, NEW.team_fee,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.candidate_fee END, NEW.candidate_fee,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.online_surcharge END, NEW.online_surcharge
  );

  RETURN NEW;
END;
$$;

-- AFTER, so the log row's group_id exists when a group is inserted.
CREATE TRIGGER weekend_groups_fees_guard_and_log
  AFTER INSERT OR UPDATE OF team_fee, candidate_fee, online_surcharge
  ON weekend_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_and_log_weekend_group_fees();
