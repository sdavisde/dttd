-- Migration: Replace full unique constraint with partial unique index
-- Allows finalized draft rows to coexist with new drafts for the same user,
-- while still preventing duplicate active (non-finalized) drafts.

ALTER TABLE "public"."draft_weekend_roster"
  DROP CONSTRAINT "draft_weekend_roster_weekend_id_user_id_key";

CREATE UNIQUE INDEX "draft_weekend_roster_weekend_id_user_id_active_key"
  ON "public"."draft_weekend_roster" ("weekend_id", "user_id")
  WHERE "finalized_at" IS NULL;
