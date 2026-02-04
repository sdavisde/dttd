-- Change Pre Weekend Couple role from INDIVIDUAL to COMMITTEE
-- This allows multiple people to be assigned to this role (typically a married couple)

UPDATE "public"."roles"
SET "type" = 'COMMITTEE'::role_type
WHERE "label" = 'Pre Weekend Couple';
