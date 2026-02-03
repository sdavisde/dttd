-- Migration: Add event fields for current weekend page feature
-- Adds: event_type enum, end_datetime, weekend_id (FK), and type columns to events table

-- Create the event_type enum
DO $$ BEGIN
  CREATE TYPE "public"."event_type" AS ENUM (
    'meeting',
    'weekend',
    'serenade',
    'sendoff',
    'closing',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add end_datetime column for multi-day event support
ALTER TABLE "public"."events"
ADD COLUMN IF NOT EXISTS "end_datetime" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "public"."events"."end_datetime"
IS 'Optional end datetime for multi-day events. If null, event is single-day using datetime field.';

-- Add weekend_id column with foreign key reference
ALTER TABLE "public"."events"
ADD COLUMN IF NOT EXISTS "weekend_id" UUID REFERENCES "public"."weekends"("id") ON DELETE SET NULL;

COMMENT ON COLUMN "public"."events"."weekend_id"
IS 'Optional reference to the weekend this event is associated with.';

-- Add type column using the event_type enum
ALTER TABLE "public"."events"
ADD COLUMN IF NOT EXISTS "type" "public"."event_type";

COMMENT ON COLUMN "public"."events"."type"
IS 'Event type for categorization and color-coding: meeting, weekend, serenade, sendoff, closing, or other.';

-- Create index for efficient weekend-based event queries
CREATE INDEX IF NOT EXISTS "events_weekend_id_idx" ON "public"."events"("weekend_id");

-- Create index for efficient datetime-based queries
CREATE INDEX IF NOT EXISTS "events_datetime_idx" ON "public"."events"("datetime");
