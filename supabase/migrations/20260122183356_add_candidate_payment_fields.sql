-- Add payment_method and notes columns to candidate_payments table
-- These columns enable manual payment recording (cash/check) similar to team payments

ALTER TABLE "public"."candidate_payments"
ADD COLUMN IF NOT EXISTS "payment_method" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "public"."candidate_payments"."payment_method" IS 'Payment method: cash, check, or card (for Stripe payments)';
COMMENT ON COLUMN "public"."candidate_payments"."notes" IS 'Optional notes for manual payments (e.g., check number)';
