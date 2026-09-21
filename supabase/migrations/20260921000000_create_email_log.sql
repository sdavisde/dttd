-- Migration: Email send log
-- Purpose: Transactional email is the only direct per-tenant cost we incur that
-- had no record on our side. This table gives us (a) a usage metric -- emails
-- sent per calendar month -- and (b) a delivery history admins can use to debug
-- "I never got the email" reports.
--
-- Deliberately does NOT store email bodies: the templates are in source control
-- and the rendered HTML frequently contains candidate medical/contact details
-- that have no business being duplicated into a log table.

CREATE TABLE IF NOT EXISTS "public"."email_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "community_id" uuid,
  "template" text NOT NULL,
  "subject" text NOT NULL,
  "recipients" text[] NOT NULL DEFAULT '{}',
  "recipient_count" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL,
  "resend_message_id" text,
  "error_summary" text,
  "sent_by_user_id" uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "email_log_status_check" CHECK ("status" IN ('sent', 'failed'))
);

COMMENT ON TABLE "public"."email_log" IS 'One row per transactional email send attempt. Metadata only -- email bodies are never stored.';
COMMENT ON COLUMN "public"."email_log"."community_id" IS 'Reserved for the upcoming multitenancy retrofit. Intentionally has no foreign key: there is no communities table yet. Backfill and add the FK when that table lands.';
COMMENT ON COLUMN "public"."email_log"."template" IS 'Short identifier for which email this was (e.g. sponsorship-notification, candidate-forms). Matches the EmailTemplate union in services/notifications/email-client.ts.';
COMMENT ON COLUMN "public"."email_log"."subject" IS 'Subject line as sent. Safe to store; the body is not.';
COMMENT ON COLUMN "public"."email_log"."recipients" IS 'The `to` addresses for this send.';
COMMENT ON COLUMN "public"."email_log"."recipient_count" IS 'Number of `to` addresses. Denormalized so usage queries never have to unnest.';
COMMENT ON COLUMN "public"."email_log"."status" IS 'sent = Resend accepted the message; failed = Resend rejected it or the call threw. This records handoff to Resend, not final inbox delivery.';
COMMENT ON COLUMN "public"."email_log"."resend_message_id" IS 'Resend message id, for cross-referencing in the Resend dashboard. NULL on failure.';
COMMENT ON COLUMN "public"."email_log"."error_summary" IS 'Short error message when status = failed. NULL otherwise.';
COMMENT ON COLUMN "public"."email_log"."sent_by_user_id" IS 'User whose session triggered the send. NULL for webhook-driven and anonymous public-form sends.';

-- Usage metrics and the admin history view both read the most recent rows
-- first, filtered by a date range.
CREATE INDEX IF NOT EXISTS "idx_email_log_created_at"
  ON "public"."email_log" ("created_at" DESC);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- Reads: admins only. Writes: none via the API at all -- rows are inserted with
-- the service-role (admin) client from the sendEmail() wrapper, which bypasses
-- RLS. Sends happen from anonymous public forms and from Stripe webhooks as
-- well as from logged-in sessions, so there is no single API role that could be
-- granted INSERT without also handing anon the ability to forge log rows.

ALTER TABLE "public"."email_log" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read the email log"
  ON "public"."email_log"
  FOR SELECT TO "authenticated"
  USING (public.auth_user_has_permission('FULL_ACCESS'));

-- No grants to "anon": the email log is never readable by the public.
GRANT SELECT ON TABLE "public"."email_log" TO "authenticated";
GRANT ALL ON TABLE "public"."email_log" TO "service_role";
