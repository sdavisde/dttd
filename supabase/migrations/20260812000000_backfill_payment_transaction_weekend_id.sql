-- Backfill payment_transaction.weekend_id for rows recorded without a weekend.
-- The manual (cash/check) payment flows historically inserted weekend_id = NULL,
-- which renders as "Unknown" in the admin payments table. Resolve the weekend
-- from each payment's target.

-- 1. Candidate payments: candidates carry their weekend directly.
UPDATE payment_transaction pt
SET weekend_id = c.weekend_id
FROM candidates c
WHERE pt.weekend_id IS NULL
  AND pt.target_type = 'candidate'
  AND pt.target_id = c.id
  AND c.weekend_id IS NOT NULL;

-- 2. Legacy weekend_roster payments: roster rows carry their weekend directly.
UPDATE payment_transaction pt
SET weekend_id = wr.weekend_id
FROM weekend_roster wr
WHERE pt.weekend_id IS NULL
  AND pt.target_type = 'weekend_roster'
  AND pt.target_id = wr.id
  AND wr.weekend_id IS NOT NULL;

-- 3. Group member payments: a group contains both a MENS and a WOMENS weekend,
-- so pick the one matching the member's gender (mirrors getGroupMemberById in
-- services/weekend-group-member/repository.ts).
UPDATE payment_transaction pt
SET weekend_id = w.id
FROM weekend_group_members gm
JOIN users u ON u.id = gm.user_id
JOIN weekends w
  ON w.group_id = gm.group_id
  AND w.type = CASE WHEN u.gender = 'female' THEN 'WOMENS' ELSE 'MENS' END
WHERE pt.weekend_id IS NULL
  AND pt.target_type = 'weekend_group_member'
  AND pt.target_id = gm.id;
