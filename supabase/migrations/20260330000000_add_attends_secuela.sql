-- Add attends_secuela column to weekend_group_members
-- Tracks whether a user signed up to serve at Secuela for this weekend group

ALTER TABLE "public"."weekend_group_members"
  ADD COLUMN "attends_secuela" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "public"."weekend_group_members"."attends_secuela"
  IS 'Whether or not this user signed up to serve at Secuela';
