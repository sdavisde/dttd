-- Migration: Create draft_weekend_roster table
-- Stores draft roster assignments that rectors can plan before finalizing

CREATE TABLE IF NOT EXISTS "public"."draft_weekend_roster" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "weekend_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "cha_role" text NOT NULL,
  "rollo" text,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "finalized_at" timestamp with time zone,
  CONSTRAINT "draft_weekend_roster_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "draft_weekend_roster_weekend_id_fkey"
    FOREIGN KEY ("weekend_id") REFERENCES "public"."weekends"("id") ON DELETE CASCADE,
  CONSTRAINT "draft_weekend_roster_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "draft_weekend_roster_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "draft_weekend_roster_weekend_id_user_id_key" UNIQUE ("weekend_id", "user_id")
);

ALTER TABLE "public"."draft_weekend_roster" OWNER TO "postgres";

-- RLS
ALTER TABLE "public"."draft_weekend_roster" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users only" ON "public"."draft_weekend_roster"
  FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."draft_weekend_roster"
  FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."draft_weekend_roster"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."draft_weekend_roster"
  FOR DELETE TO "authenticated" USING (true);

GRANT ALL ON TABLE "public"."draft_weekend_roster" TO "anon";
GRANT ALL ON TABLE "public"."draft_weekend_roster" TO "authenticated";
GRANT ALL ON TABLE "public"."draft_weekend_roster" TO "service_role";
