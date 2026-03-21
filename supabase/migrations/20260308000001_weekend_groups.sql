-- Migration 1: Create weekend_groups table
-- Migrate number from weekends, add FK, drop weekends.number

CREATE TABLE IF NOT EXISTS "public"."weekend_groups" (
  "id" uuid NOT NULL,
  "number" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "weekend_groups_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."weekend_groups" OWNER TO "postgres";

-- Backfill: one row per distinct group_id in weekends, copying number from the first matching weekend row
INSERT INTO "public"."weekend_groups" ("id", "number")
SELECT DISTINCT ON (w.group_id)
  w.group_id AS id,
  w.number::integer AS number
FROM "public"."weekends" w
WHERE w.group_id IS NOT NULL
  AND w.number IS NOT NULL
ORDER BY w.group_id, w.created_at ASC
ON CONFLICT (id) DO NOTHING;

-- Add FK constraint from weekends.group_id → weekend_groups.id
ALTER TABLE "public"."weekends"
  ADD CONSTRAINT "weekends_group_id_fkey"
  FOREIGN KEY ("group_id") REFERENCES "public"."weekend_groups"("id");

-- Drop the now-migrated number column from weekends
ALTER TABLE "public"."weekends" DROP COLUMN IF EXISTS "number";

-- RLS: grant access
ALTER TABLE "public"."weekend_groups" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users only" ON "public"."weekend_groups"
  FOR SELECT TO "authenticated" USING (true);

GRANT ALL ON TABLE "public"."weekend_groups" TO "anon";
GRANT ALL ON TABLE "public"."weekend_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."weekend_groups" TO "service_role";
