-- Migration 4: Create user_medical_profiles table with RLS
-- Backfill from weekend_roster medical columns, then drop those columns

CREATE TABLE IF NOT EXISTS "public"."user_medical_profiles" (
  "user_id" uuid NOT NULL,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "medical_conditions" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "user_medical_profiles_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "user_medical_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."user_medical_profiles" OWNER TO "postgres";

-- Backfill: for each user in weekend_roster with medical data,
-- take the most recent non-null value per column (ordered by weekends.created_at DESC)
WITH ranked AS (
  SELECT
    wr.user_id,
    wr.emergency_contact_name,
    wr.emergency_contact_phone,
    wr.medical_conditions,
    ROW_NUMBER() OVER (
      PARTITION BY wr.user_id
      ORDER BY w.created_at DESC
    ) AS rn
  FROM "public"."weekend_roster" wr
  JOIN "public"."weekends" w ON w.id = wr.weekend_id
  WHERE wr.user_id IS NOT NULL
    AND (
      wr.emergency_contact_name IS NOT NULL
      OR wr.emergency_contact_phone IS NOT NULL
      OR wr.medical_conditions IS NOT NULL
    )
),
best AS (
  SELECT user_id, emergency_contact_name, emergency_contact_phone, medical_conditions
  FROM ranked
  WHERE rn = 1
)
INSERT INTO "public"."user_medical_profiles" (
  "user_id",
  "emergency_contact_name",
  "emergency_contact_phone",
  "medical_conditions"
)
SELECT
  user_id,
  emergency_contact_name,
  emergency_contact_phone,
  medical_conditions
FROM best
ON CONFLICT ("user_id") DO UPDATE SET
  "emergency_contact_name"  = COALESCE(EXCLUDED.emergency_contact_name,  user_medical_profiles.emergency_contact_name),
  "emergency_contact_phone" = COALESCE(EXCLUDED.emergency_contact_phone, user_medical_profiles.emergency_contact_phone),
  "medical_conditions"      = COALESCE(EXCLUDED.medical_conditions,       user_medical_profiles.medical_conditions),
  "updated_at"              = now();

-- Drop medical columns from weekend_roster
ALTER TABLE "public"."weekend_roster"
  DROP COLUMN IF EXISTS "emergency_contact_name",
  DROP COLUMN IF EXISTS "emergency_contact_phone",
  DROP COLUMN IF EXISTS "medical_conditions";

-- RLS: users can only see/edit their own profile; service role bypasses by default
ALTER TABLE "public"."user_medical_profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own medical profile" ON "public"."user_medical_profiles"
  FOR SELECT TO "authenticated" USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical profile" ON "public"."user_medical_profiles"
  FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical profile" ON "public"."user_medical_profiles"
  FOR UPDATE TO "authenticated" USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE "public"."user_medical_profiles" TO "service_role";
GRANT SELECT, INSERT, UPDATE ON TABLE "public"."user_medical_profiles" TO "authenticated";
