-- Migration 2: Create weekend_group_members table
-- Backfill from weekend_roster via weekends → weekend_groups

CREATE TABLE IF NOT EXISTS "public"."weekend_group_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "group_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "weekend_group_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "weekend_group_members_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "public"."weekend_groups"("id") ON DELETE CASCADE,
  CONSTRAINT "weekend_group_members_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "weekend_group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id")
);

ALTER TABLE "public"."weekend_group_members" OWNER TO "postgres";

-- Backfill: one row per distinct (group_id, user_id) pair from weekend_roster
INSERT INTO "public"."weekend_group_members" ("group_id", "user_id")
SELECT DISTINCT wg.id AS group_id, wr.user_id
FROM "public"."weekend_roster" wr
JOIN "public"."weekends" w ON w.id = wr.weekend_id
JOIN "public"."weekend_groups" wg ON wg.id = w.group_id
WHERE wr.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE "public"."weekend_group_members" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users only" ON "public"."weekend_group_members"
  FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."weekend_group_members"
  FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."weekend_group_members"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."weekend_group_members"
  FOR DELETE TO "authenticated" USING (true);

GRANT ALL ON TABLE "public"."weekend_group_members" TO "anon";
GRANT ALL ON TABLE "public"."weekend_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."weekend_group_members" TO "service_role";
