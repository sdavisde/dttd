-- Migration: Change events.weekend_id FK from weekends to weekend_groups
-- Events belong to a weekend group (both Men's and Women's weekends), not an individual weekend.

-- Step 1: Drop the existing FK and index
ALTER TABLE "public"."events" DROP CONSTRAINT IF EXISTS "events_weekend_id_fkey";
DROP INDEX IF EXISTS "events_weekend_id_idx";

-- Step 2: Rename the column
ALTER TABLE "public"."events" RENAME COLUMN "weekend_id" TO "weekend_group_id";

-- Step 3: Add new FK referencing weekend_groups
ALTER TABLE "public"."events"
ADD CONSTRAINT "events_weekend_group_id_fkey"
FOREIGN KEY ("weekend_group_id") REFERENCES "public"."weekend_groups"("id") ON DELETE SET NULL;

-- Step 4: Recreate index on the renamed column
CREATE INDEX IF NOT EXISTS "events_weekend_group_id_idx" ON "public"."events"("weekend_group_id");

-- Step 5: Update column comment
COMMENT ON COLUMN "public"."events"."weekend_group_id"
IS 'Optional reference to the weekend group this event is associated with.';
