-- Keep public.users.email in sync when auth.users.email changes (e.g. after a
-- confirmed email change). The original on_auth_user_change trigger only fired
-- on INSERT/DELETE, so a confirmed email change left public.users.email stale.

CREATE OR REPLACE FUNCTION "public"."sync_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (
      id,
      first_name,
      last_name,
      gender,
      email
    )
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data::jsonb)->>'first_name', ''),
      COALESCE((NEW.raw_user_meta_data::jsonb)->>'last_name', ''),
      COALESCE((NEW.raw_user_meta_data::jsonb)->>'gender', ''),
      NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = COALESCE((NEW.raw_user_meta_data::jsonb)->>'first_name', ''),
      last_name = COALESCE((NEW.raw_user_meta_data::jsonb)->>'last_name', ''),
      gender = COALESCE((NEW.raw_user_meta_data::jsonb)->>'gender', ''),
      email = NEW.email;
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;$$;

DROP TRIGGER IF EXISTS on_auth_user_change ON auth.users;

CREATE TRIGGER on_auth_user_change
  AFTER INSERT OR UPDATE OF email OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_users();

-- One-time backfill for rows that already diverged. NOTE: this overwrites
-- public.users.email with auth.users.email. If an admin intentionally edited a
-- user's email via the admin UI (which only writes public.users), that edit is
-- reverted here — check for diverged rows before running in production:
--   select u.id, u.email, au.email from public.users u
--   join auth.users au on au.id = u.id
--   where u.email is distinct from au.email;
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE au.id = u.id
  AND u.email IS DISTINCT FROM au.email;
