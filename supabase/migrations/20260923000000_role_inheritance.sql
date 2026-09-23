-- Role inheritance ("based on") for the Security page.
--
-- A role may be based on another role and gains every permission that role
-- has (transitively). Inheritance is additive only: a child can never remove
-- something its parent grants. The effective permission set is resolved in
-- application code (services/identity/roles/inheritance.ts); the database
-- only stores the edge and refuses cycles.
--
-- Also removes permission values that were never part of the Permission enum
-- (READ_USERS, READ_MEETINGS, WRITE_MEETINGS) from existing rows. They were
-- seeded historically and do nothing.
--
-- Idempotent: safe to run more than once. Written for Postgres 15.

-- ---------------------------------------------------------------------------
-- 1. The inheritance edge
-- ---------------------------------------------------------------------------
ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS based_on_role_id uuid NULL
    REFERENCES public.roles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS roles_based_on_role_id_idx
  ON public.roles (based_on_role_id);

-- ---------------------------------------------------------------------------
-- 2. Cycle guard: a role may not (directly or transitively) be based on itself
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.roles_prevent_inheritance_cycle()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cycle_found boolean;
BEGIN
  IF NEW.based_on_role_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.based_on_role_id = NEW.id THEN
    RAISE EXCEPTION 'A role cannot be based on itself'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Walk up the chain from the proposed parent. If we reach NEW.id, the edge
  -- would close a loop. The `depth` bound protects against a pre-existing
  -- loop (which this trigger should have prevented) looping forever.
  WITH RECURSIVE ancestors AS (
    SELECT r.id, r.based_on_role_id, 1 AS depth
    FROM public.roles r
    WHERE r.id = NEW.based_on_role_id
    UNION ALL
    SELECT r.id, r.based_on_role_id, a.depth + 1
    FROM public.roles r
    JOIN ancestors a ON r.id = a.based_on_role_id
    WHERE a.depth < 100
  )
  SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = NEW.id) INTO cycle_found;

  IF cycle_found THEN
    RAISE EXCEPTION 'Role inheritance would form a cycle (role % -> %)',
      NEW.id, NEW.based_on_role_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS roles_prevent_inheritance_cycle ON public.roles;

CREATE TRIGGER roles_prevent_inheritance_cycle
  BEFORE INSERT OR UPDATE OF based_on_role_id ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.roles_prevent_inheritance_cycle();

-- ---------------------------------------------------------------------------
-- 3. Drop permission values that are not in the application's Permission enum
-- ---------------------------------------------------------------------------
UPDATE public.roles
SET permissions = array_remove(
  array_remove(array_remove(permissions, 'READ_USERS'), 'READ_MEETINGS'),
  'WRITE_MEETINGS'
)
WHERE permissions && ARRAY['READ_USERS', 'READ_MEETINGS', 'WRITE_MEETINGS']::text[];

-- NOTE: no CHECK constraint on roles.permissions. The list of valid values
-- lives in lib/security.ts (the Permission enum) and a copy here would drift
-- from it the next time a permission is added.
