-- Add description and type columns to roles table
-- description: Brief text description of what each role does and is responsible for
-- type: Distinguishes between individual roles (single assignee) and committee roles (multiple assignees)

-- Add description column
ALTER TABLE "public"."roles"
ADD COLUMN IF NOT EXISTS "description" TEXT;

COMMENT ON COLUMN "public"."roles"."description" IS 'Brief description of what the role does and its responsibilities';

-- Create enum type for role types
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('INDIVIDUAL', 'COMMITTEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add type column
ALTER TABLE "public"."roles"
ADD COLUMN IF NOT EXISTS "type" role_type NOT NULL DEFAULT 'INDIVIDUAL';

COMMENT ON COLUMN "public"."roles"."type" IS 'Role type: INDIVIDUAL (single assignee) or COMMITTEE (multiple assignees)';

-- Populate descriptions and types for existing roles
UPDATE "public"."roles"
SET
  "description" = CASE
    WHEN label = 'Full Access' THEN 'Full administrative access for managing settings, permissions, and org data.'
    WHEN label = 'Leaders Committee' THEN 'Committee members who advise and support board initiatives across the organization.'
    WHEN label = 'Admin' THEN 'Full administrative access for managing settings, permissions, and org data.'
    WHEN label = 'Pre Weekend Couple' THEN 'Coordinates pre-weekend engagement and readiness for upcoming teams.'
    WHEN label = 'Corresponding Secretary' THEN 'Records and distributes board meeting minutes and official communications.'
    WHEN label = 'President' THEN 'Provides overall leadership, vision, and accountability for the community board.'
    WHEN label = 'Vice President' THEN 'Supports the president and coordinates cross-functional board efforts.'
    WHEN label = 'Treasurer' THEN 'Oversees financial reporting, budgeting, and stewardship guidance.'
    WHEN label = 'Recording Secretary' THEN 'Maintains records, meeting notes, and official documentation for board sessions.'
    WHEN label = 'Community Spiritual Director' THEN 'Leads spiritual formation and provides guidance for the broader community.'
    ELSE NULL
  END,
  "type" = CASE
    WHEN label = 'Leaders Committee' THEN 'COMMITTEE'::role_type
    WHEN label = 'Full Access' THEN 'COMMITTEE'::role_type
    ELSE 'INDIVIDUAL'::role_type
  END
WHERE "description" IS NULL;
