-- Add missing INSERT, UPDATE, and DELETE RLS policies for weekend_groups.
-- The original migration only created a SELECT policy, blocking all writes
-- from authenticated users.

CREATE POLICY "Enable insert for authenticated users only" ON "public"."weekend_groups"
  FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."weekend_groups"
  FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."weekend_groups"
  FOR DELETE TO "authenticated" USING (true);
