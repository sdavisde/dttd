-- Allow admins (FULL_ACCESS role) to read and write any user's medical profile.
-- This is needed for impersonation: when an admin acts as another user,
-- auth.uid() is the admin's UUID, not the impersonated user's, so the
-- existing per-user policies would block the write.
-- Postgres ORs multiple policies together, so either condition passing is sufficient.

CREATE POLICY "Admins can manage any medical profile"
  ON "public"."user_medical_profiles"
  FOR ALL TO "authenticated"
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND 'FULL_ACCESS' = ANY(r.permissions)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND 'FULL_ACCESS' = ANY(r.permissions)
    )
  );
