-- Migration: Add weekend_id to events for per-weekend singleton events
-- Singleton event types (weekend, sendoff, serenade, closing) need to reference
-- a specific Men's or Women's weekend, not just the group.

-- Step 1: Add the column
ALTER TABLE "public"."events"
ADD COLUMN IF NOT EXISTS "weekend_id" UUID
REFERENCES "public"."weekends"("id") ON DELETE SET NULL;

-- Step 2: Index for lookups by weekend
CREATE INDEX IF NOT EXISTS "events_weekend_id_idx"
ON "public"."events"("weekend_id");

-- Step 3: Enforce singleton constraint — only one of each type per individual weekend
CREATE UNIQUE INDEX "events_singleton_per_weekend"
ON "public"."events"("weekend_id", "type")
WHERE type IN ('weekend', 'sendoff', 'serenade', 'closing')
AND weekend_id IS NOT NULL;

-- Step 4: Document the column
COMMENT ON COLUMN "public"."events"."weekend_id"
IS 'For singleton event types (weekend/sendoff/serenade/closing), references the specific Men''s or Women''s weekend. Null for group-level types (meeting/secuela) and community events.';
