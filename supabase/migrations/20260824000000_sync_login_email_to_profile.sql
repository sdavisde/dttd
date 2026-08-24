-- Keep public.users.email in sync with the address a member logs in with.
--
-- Changing a login email goes through Supabase's admin API
-- (auth.admin.updateUserById), which writes auth.users and nothing else. Without this
-- trigger the profile row keeps the old address, so the master roster and every Resend
-- email would target an address the account no longer authenticates with.
--
-- Propagating from a trigger rather than a second write from the application is what
-- keeps the two tables from drifting: the profile update commits in the same
-- transaction as the auth update, so there is no window where one has landed and the
-- other has not, and no partial failure to unwind.

CREATE OR REPLACE FUNCTION "public"."sync_users"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    -- Pin the search path so the fully-qualified writes below cannot be redirected at
    -- an attacker-controlled schema. Supabase's own linter flags SECURITY DEFINER
    -- functions that leave it mutable.
    SET "search_path" = ''
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
      gender = COALESCE((NEW.raw_user_meta_data::jsonb)->>'gender', '');
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- GoTrue rewrites auth.users on ordinary activity such as a sign-in, and those
    -- writes can list the email column without changing its value. Comparing first
    -- keeps this to an actual address change. IS DISTINCT FROM rather than <> so a
    -- transition to or from NULL still counts.
    IF (NEW.email IS DISTINCT FROM OLD.email) THEN
      UPDATE public.users SET email = NEW.email WHERE id = NEW.id;
    END IF;
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;$$;

ALTER FUNCTION "public"."sync_users"() OWNER TO "postgres";

-- Recreate the trigger to add the UPDATE arm. `UPDATE OF email` narrows the wake-ups
-- to statements that target the email column at all; the guard above handles the rest.
DROP TRIGGER IF EXISTS "on_auth_user_change" ON "auth"."users";

CREATE TRIGGER "on_auth_user_change"
  AFTER INSERT OR DELETE OR UPDATE OF "email" ON "auth"."users"
  FOR EACH ROW EXECUTE FUNCTION "public"."sync_users"();
