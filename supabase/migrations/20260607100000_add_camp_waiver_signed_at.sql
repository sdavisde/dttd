-- Records that a candidate signed the Tanglewood Christian Camp waiver as part of
-- their intake forms. Mirrors the team-member flow, which only tracks that the
-- waiver was completed (not the signature text itself). NULL means not yet signed.
ALTER TABLE "public"."candidate_info"
  ADD COLUMN "camp_waiver_signed_at" timestamptz;
