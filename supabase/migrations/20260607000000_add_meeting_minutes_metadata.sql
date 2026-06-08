-- Stores supplementary metadata for meeting minutes files (currently just a
-- location). The files themselves live in Supabase Storage and are uploaded via
-- signed URLs, which cannot carry custom object metadata. We persist that here
-- instead, keyed by the file's full storage path within the `files` bucket.

CREATE TABLE "public"."meeting_minutes_metadata" (
  "storage_path" text PRIMARY KEY,
  "location" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "public"."meeting_minutes_metadata" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users only"
  ON "public"."meeting_minutes_metadata"
  FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON "public"."meeting_minutes_metadata"
  FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON "public"."meeting_minutes_metadata"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON "public"."meeting_minutes_metadata"
  FOR DELETE TO "authenticated" USING (true);

-- Keep the metadata table consistent when the underlying storage object is
-- removed. Deletes happen client-side directly against storage, so a trigger is
-- the only place that reliably catches every deletion path.
CREATE OR REPLACE FUNCTION "public"."delete_meeting_minutes_metadata"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.bucket_id = 'files' THEN
    DELETE FROM "public"."meeting_minutes_metadata"
    WHERE "storage_path" = OLD.name;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER "on_storage_object_deleted_cleanup_meeting_minutes"
  AFTER DELETE ON "storage"."objects"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."delete_meeting_minutes_metadata"();
