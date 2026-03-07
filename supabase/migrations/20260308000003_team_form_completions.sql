-- Migration 3: Create team_form_completions table
-- Backfill from weekend_roster completed_*_at columns, then drop those columns

CREATE TABLE IF NOT EXISTS "public"."team_form_completions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "weekend_group_member_id" uuid NOT NULL,
  "form_type" text NOT NULL,
  "completed_at" timestamp with time zone NOT NULL,
  CONSTRAINT "team_form_completions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "team_form_completions_weekend_group_member_id_fkey"
    FOREIGN KEY ("weekend_group_member_id") REFERENCES "public"."weekend_group_members"("id") ON DELETE CASCADE,
  CONSTRAINT "team_form_completions_member_form_key" UNIQUE ("weekend_group_member_id", "form_type")
);

ALTER TABLE "public"."team_form_completions" OWNER TO "postgres";

-- Backfill: union all five form columns, take MAX(completed_at) per (member, form_type)
WITH completions AS (
  SELECT
    wgm.id AS weekend_group_member_id,
    form_data.form_type,
    form_data.completed_at
  FROM "public"."weekend_roster" wr
  JOIN "public"."weekends" w ON w.id = wr.weekend_id
  JOIN "public"."weekend_group_members" wgm
    ON wgm.group_id = w.group_id AND wgm.user_id = wr.user_id
  CROSS JOIN LATERAL (
    VALUES
      ('statement_of_belief',  wr.completed_statement_of_belief_at),
      ('commitment_form',      wr.completed_commitment_form_at),
      ('release_of_claim',     wr.completed_release_of_claim_at),
      ('camp_waiver',          wr.completed_camp_waiver_at),
      ('info_sheet',           wr.completed_info_sheet_at)
  ) AS form_data(form_type, completed_at)
  WHERE form_data.completed_at IS NOT NULL
    AND wr.user_id IS NOT NULL
),
deduped AS (
  SELECT
    weekend_group_member_id,
    form_type,
    MAX(completed_at) AS completed_at
  FROM completions
  GROUP BY weekend_group_member_id, form_type
)
INSERT INTO "public"."team_form_completions" ("weekend_group_member_id", "form_type", "completed_at")
SELECT weekend_group_member_id, form_type, completed_at
FROM deduped
ON CONFLICT ("weekend_group_member_id", "form_type")
DO UPDATE SET "completed_at" = EXCLUDED.completed_at;

-- Drop the five completed_*_at columns from weekend_roster
ALTER TABLE "public"."weekend_roster"
  DROP COLUMN IF EXISTS "completed_statement_of_belief_at",
  DROP COLUMN IF EXISTS "completed_commitment_form_at",
  DROP COLUMN IF EXISTS "completed_release_of_claim_at",
  DROP COLUMN IF EXISTS "completed_camp_waiver_at",
  DROP COLUMN IF EXISTS "completed_info_sheet_at";

-- RLS
ALTER TABLE "public"."team_form_completions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users only" ON "public"."team_form_completions"
  FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."team_form_completions"
  FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."team_form_completions"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

GRANT ALL ON TABLE "public"."team_form_completions" TO "anon";
GRANT ALL ON TABLE "public"."team_form_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."team_form_completions" TO "service_role";
