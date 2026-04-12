-- Migrate attends_secuela from boolean to attended_secuela_at timestamptz
-- A non-null timestamp means the user signed up; comparing against the secuela
-- event date distinguishes "Attended Secuela" from "Wants to Serve"

-- Step 1: Add the new timestamptz column
ALTER TABLE "public"."weekend_group_members"
  ADD COLUMN "attended_secuela_at" timestamptz;

-- Step 2: Backfill existing true values with NOW()
UPDATE "public"."weekend_group_members"
  SET "attended_secuela_at" = NOW()
  WHERE "attends_secuela" = true;

-- Step 3: Drop the old boolean column
ALTER TABLE "public"."weekend_group_members"
  DROP COLUMN "attends_secuela";

COMMENT ON COLUMN "public"."weekend_group_members"."attended_secuela_at"
  IS 'Timestamp of when the user signed up for secuela (null = not attending)';

-- Step 4: Add secuela event type
ALTER TYPE "public"."event_type" ADD VALUE 'secuela';
