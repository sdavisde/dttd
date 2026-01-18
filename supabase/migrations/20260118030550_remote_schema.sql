

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."candidate_status" AS ENUM (
    'sponsored',
    'awaiting_forms',
    'pending_approval',
    'awaiting_payment',
    'confirmed',
    'rejected'
);


ALTER TYPE "public"."candidate_status" OWNER TO "postgres";


CREATE TYPE "public"."permissions" AS ENUM (
    'READ_MEDICAL_HISTORY'
);


ALTER TYPE "public"."permissions" OWNER TO "postgres";


CREATE TYPE "public"."weekend_type" AS ENUM (
    'MENS',
    'WOMENS'
);


ALTER TYPE "public"."weekend_type" OWNER TO "postgres";


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
      gender = COALESCE((NEW.raw_user_meta_data::jsonb)->>'gender', '');
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;$$;


ALTER FUNCTION "public"."sync_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_community_encouragements_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_community_encouragements_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."candidate_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "candidate_id" "uuid",
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "date_of_birth" "date" NOT NULL,
    "shirt_size" character varying(10) NOT NULL,
    "marital_status" character varying(20),
    "has_spouse_attended_weekend" boolean DEFAULT false,
    "spouse_weekend_location" "text",
    "spouse_name" character varying(255),
    "has_friends_attending_weekend" boolean DEFAULT false,
    "is_christian" boolean DEFAULT false,
    "church" character varying(255),
    "member_of_clergy" boolean DEFAULT false,
    "reason_for_attending" "text",
    "address_line_1" character varying(255) NOT NULL,
    "address_line_2" character varying(255),
    "city" character varying(255) NOT NULL,
    "state" character varying(50) NOT NULL,
    "zip" character varying(20) NOT NULL,
    "phone" character varying(20) NOT NULL,
    "emergency_contact_name" character varying(255) NOT NULL,
    "emergency_contact_phone" character varying(20) NOT NULL,
    "medical_conditions" "text",
    "age" integer
);


ALTER TABLE "public"."candidate_info" OWNER TO "postgres";


COMMENT ON COLUMN "public"."candidate_info"."first_name" IS 'First name of the candidate';



COMMENT ON COLUMN "public"."candidate_info"."last_name" IS 'Last name of the candidate';



COMMENT ON COLUMN "public"."candidate_info"."email" IS 'Email address of the candidate';



COMMENT ON COLUMN "public"."candidate_info"."date_of_birth" IS 'Date of birth of the candidate';



COMMENT ON COLUMN "public"."candidate_info"."shirt_size" IS 'Shirt size (XS, S, M, L, XL, XXL, XXXL)';



COMMENT ON COLUMN "public"."candidate_info"."marital_status" IS 'Marital status (single, married, widowed, divorced, separated)';



COMMENT ON COLUMN "public"."candidate_info"."has_spouse_attended_weekend" IS 'Whether spouse has attended a Tres Dias weekend';



COMMENT ON COLUMN "public"."candidate_info"."spouse_weekend_location" IS 'Location where spouse attended weekend';



COMMENT ON COLUMN "public"."candidate_info"."spouse_name" IS 'Name of spouse if they submitted application';



COMMENT ON COLUMN "public"."candidate_info"."has_friends_attending_weekend" IS 'Whether friends/relatives are attending this weekend';



COMMENT ON COLUMN "public"."candidate_info"."is_christian" IS 'Whether the candidate is a Christian';



COMMENT ON COLUMN "public"."candidate_info"."church" IS 'Church the candidate attends';



COMMENT ON COLUMN "public"."candidate_info"."member_of_clergy" IS 'Whether candidate is clergy or ordained';



COMMENT ON COLUMN "public"."candidate_info"."reason_for_attending" IS 'Reason for wanting to attend the weekend';



COMMENT ON COLUMN "public"."candidate_info"."age" IS 'Calculated age of the candidate';



CREATE TABLE IF NOT EXISTS "public"."candidate_payments" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "candidate_id" "uuid",
    "payment_amount" numeric,
    "payment_owner" "text" NOT NULL,
    "payment_intent_id" "text" NOT NULL
);


ALTER TABLE "public"."candidate_payments" OWNER TO "postgres";


ALTER TABLE "public"."candidate_payments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."candidate_payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."candidate_sponsorship_info" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "candidate_id" "uuid",
    "sponsor_name" "text",
    "sponsor_email" "text",
    "sponsor_address" "text",
    "sponsor_church" "text",
    "sponsor_weekend" "text",
    "reunion_group" "text",
    "contact_frequency" "text",
    "church_environment" "text",
    "home_environment" "text",
    "social_environment" "text",
    "work_environment" "text",
    "god_evidence" "text",
    "support_plan" "text",
    "prayer_request" "text",
    "payment_owner" "text",
    "attends_secuela" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_name" "text",
    "candidate_email" "text",
    "sponsor_phone" "text"
);


ALTER TABLE "public"."candidate_sponsorship_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "weekend_id" "uuid",
    "status" "public"."candidate_status" DEFAULT 'sponsored'::"public"."candidate_status" NOT NULL
);


ALTER TABLE "public"."candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_encouragements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by_user_id" "uuid"
);


ALTER TABLE "public"."community_encouragements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_information" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "label" "text",
    "email_address" "text"
);


ALTER TABLE "public"."contact_information" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text",
    "datetime" timestamp with time zone,
    "location" "text"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


ALTER TABLE "public"."events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "label" "text" NOT NULL,
    "permissions" "text"[] NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "gender" "text",
    "phone_number" "text",
    "email" "text",
    "address" "jsonb",
    "church_affiliation" "text",
    "weekend_attended" "text",
    "essentials_training_date" timestamp with time zone,
    "special_gifts_and_skills" "text"[]
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."special_gifts_and_skills" IS 'List of gifts and skills that users can contribute to a weekend';



CREATE TABLE IF NOT EXISTS "public"."users_experience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "weekend_id" "uuid",
    "weekend_reference" "text" NOT NULL,
    "cha_role" "text" NOT NULL,
    "rollo" "text",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."users_experience" OWNER TO "postgres";


COMMENT ON TABLE "public"."users_experience" IS 'A record of the roles users have had on previous Tres Dias weekends';



CREATE TABLE IF NOT EXISTS "public"."weekend_roster" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "weekend_id" "uuid",
    "user_id" "uuid",
    "cha_role" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" "text",
    "rollo" "text",
    "additional_cha_role" "text",
    "special_needs" "text",
    "completed_statement_of_belief_at" timestamp with time zone,
    "completed_commitment_form_at" timestamp with time zone,
    "completed_release_of_claim_at" timestamp with time zone,
    "completed_camp_waiver_at" timestamp with time zone,
    "completed_info_sheet_at" timestamp with time zone,
    "emergency_contact_name" "text",
    "emergency_contact_phone" "text",
    "medical_conditions" "text"
);


ALTER TABLE "public"."weekend_roster" OWNER TO "postgres";


COMMENT ON TABLE "public"."weekend_roster" IS 'Contains all the team members and their roles tied to a weekend';



COMMENT ON COLUMN "public"."weekend_roster"."rollo" IS 'The rollo this team member is speaking, if applicable. Applies to table leaders and spiritual directors.';



COMMENT ON COLUMN "public"."weekend_roster"."additional_cha_role" IS 'An optional secondary role that a team member can have on the weekend';



COMMENT ON COLUMN "public"."weekend_roster"."special_needs" IS 'Any special needs that a team member might require to attend the weekend';



CREATE TABLE IF NOT EXISTS "public"."weekend_roster_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "weekend_roster_id" "uuid",
    "payment_amount" numeric,
    "payment_intent_id" "text" NOT NULL,
    "payment_method" "text",
    "notes" "text"
);


ALTER TABLE "public"."weekend_roster_payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."weekend_roster_payments"."payment_method" IS 'The payment method used for a team fee';



CREATE TABLE IF NOT EXISTS "public"."weekends" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."weekend_type" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "number" bigint,
    "title" "text",
    "status" "text" DEFAULT '''pre-weekend''::text'::"text",
    "group_id" "uuid"
);


ALTER TABLE "public"."weekends" OWNER TO "postgres";


COMMENT ON COLUMN "public"."weekends"."status" IS 'The status of the DTTD weekend (i.e. "Pre-weekend", "Active", "Finished")';



COMMENT ON COLUMN "public"."weekends"."group_id" IS 'Identifier tying men/women weekends together';



ALTER TABLE ONLY "public"."candidate_info"
    ADD CONSTRAINT "candidate_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_payments"
    ADD CONSTRAINT "candidate_payments_payment_intent_id_key" UNIQUE ("payment_intent_id");



ALTER TABLE ONLY "public"."candidate_payments"
    ADD CONSTRAINT "candidate_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_sponsorship_info"
    ADD CONSTRAINT "candidate_sponsorship_info_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."candidate_sponsorship_info"
    ADD CONSTRAINT "candidate_sponsorship_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_encouragements"
    ADD CONSTRAINT "community_encouragements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_information"
    ADD CONSTRAINT "contact_information_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_experience"
    ADD CONSTRAINT "users_experience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weekend_roster_payments"
    ADD CONSTRAINT "weekend_roster_payments_payment_intent_id_key" UNIQUE ("payment_intent_id");



ALTER TABLE ONLY "public"."weekend_roster_payments"
    ADD CONSTRAINT "weekend_roster_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weekend_roster"
    ADD CONSTRAINT "weekend_roster_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weekends"
    ADD CONSTRAINT "weekends_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "community_encouragements_single_row" ON "public"."community_encouragements" USING "btree" ((1));



CREATE OR REPLACE TRIGGER "update_community_encouragements_updated_at" BEFORE UPDATE ON "public"."community_encouragements" FOR EACH ROW EXECUTE FUNCTION "public"."update_community_encouragements_updated_at"();



ALTER TABLE ONLY "public"."candidate_info"
    ADD CONSTRAINT "candidate_info_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."candidate_payments"
    ADD CONSTRAINT "candidate_payments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."candidate_sponsorship_info"
    ADD CONSTRAINT "candidate_sponsorship_info_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_weekend_id_fkey" FOREIGN KEY ("weekend_id") REFERENCES "public"."weekends"("id");



ALTER TABLE ONLY "public"."community_encouragements"
    ADD CONSTRAINT "community_encouragements_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_experience"
    ADD CONSTRAINT "users_experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_experience"
    ADD CONSTRAINT "users_experience_weekend_id_fkey" FOREIGN KEY ("weekend_id") REFERENCES "public"."weekends"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weekend_roster_payments"
    ADD CONSTRAINT "weekend_roster_payments_weekend_roster_id_fkey" FOREIGN KEY ("weekend_roster_id") REFERENCES "public"."weekend_roster"("id");



ALTER TABLE ONLY "public"."weekend_roster"
    ADD CONSTRAINT "weekend_roster_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."weekend_roster"
    ADD CONSTRAINT "weekend_roster_weekend_id_fkey" FOREIGN KEY ("weekend_id") REFERENCES "public"."weekends"("id");



CREATE POLICY "Allow all users to delete roles" ON "public"."roles" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to delete user_roles" ON "public"."user_roles" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to delete users" ON "public"."users" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to insert roles" ON "public"."roles" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow all users to insert user_roles" ON "public"."user_roles" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow all users to insert users" ON "public"."users" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow all users to select roles" ON "public"."roles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to select user_roles" ON "public"."user_roles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to select users" ON "public"."users" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow all users to update roles" ON "public"."roles" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all users to update user_roles" ON "public"."user_roles" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all users to update users" ON "public"."users" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to create candidate_sponsorship_info" ON "public"."candidate_sponsorship_info" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to delete candidate_info" ON "public"."candidate_info" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete candidate_sponsorship_info" ON "public"."candidate_sponsorship_info" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete candidates" ON "public"."candidates" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete contact information" ON "public"."contact_information" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert candidate_info" ON "public"."candidate_info" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert candidates" ON "public"."candidates" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert contact information" ON "public"."contact_information" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert weekends" ON "public"."weekends" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read candidate_sponsorship_info" ON "public"."candidate_sponsorship_info" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow authenticated users to select contact information" ON "public"."contact_information" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select weekends" ON "public"."weekends" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update candidate_info" ON "public"."candidate_info" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update candidate_sponsorship_info" ON "public"."candidate_sponsorship_info" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update candidates" ON "public"."candidates" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update contact information" ON "public"."contact_information" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update weekends" ON "public"."weekends" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can insert candidate_payments" ON "public"."candidate_payments" FOR INSERT TO "authenticated", "anon" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update candidate_payments" ON "public"."candidate_payments" FOR UPDATE TO "authenticated", "anon" USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view candidate_payments" ON "public"."candidate_payments" FOR SELECT TO "authenticated", "anon" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable delete for authenticated users" ON "public"."users_experience" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."events" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."weekend_roster" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."community_encouragements" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."users_experience" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."weekend_roster" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."weekend_roster_payments" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."candidate_info" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."candidates" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."community_encouragements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users_experience" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read for authenticated users only" ON "public"."weekend_roster" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read for authenticated users only" ON "public"."weekend_roster_payments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."users_experience" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."community_encouragements" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."events" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."weekend_roster" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."weekend_roster_payments" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."candidate_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_sponsorship_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_encouragements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_information" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users_experience" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weekend_roster" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weekend_roster_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weekends" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."sync_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_community_encouragements_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_community_encouragements_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_community_encouragements_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."candidate_info" TO "anon";
GRANT ALL ON TABLE "public"."candidate_info" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_info" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_payments" TO "anon";
GRANT ALL ON TABLE "public"."candidate_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."candidate_payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."candidate_payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."candidate_payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_sponsorship_info" TO "anon";
GRANT ALL ON TABLE "public"."candidate_sponsorship_info" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_sponsorship_info" TO "service_role";



GRANT ALL ON TABLE "public"."candidates" TO "anon";
GRANT ALL ON TABLE "public"."candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."candidates" TO "service_role";



GRANT ALL ON TABLE "public"."community_encouragements" TO "anon";
GRANT ALL ON TABLE "public"."community_encouragements" TO "authenticated";
GRANT ALL ON TABLE "public"."community_encouragements" TO "service_role";



GRANT ALL ON TABLE "public"."contact_information" TO "anon";
GRANT ALL ON TABLE "public"."contact_information" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_information" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."users_experience" TO "anon";
GRANT ALL ON TABLE "public"."users_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."users_experience" TO "service_role";



GRANT ALL ON TABLE "public"."weekend_roster" TO "anon";
GRANT ALL ON TABLE "public"."weekend_roster" TO "authenticated";
GRANT ALL ON TABLE "public"."weekend_roster" TO "service_role";



GRANT ALL ON TABLE "public"."weekend_roster_payments" TO "anon";
GRANT ALL ON TABLE "public"."weekend_roster_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."weekend_roster_payments" TO "service_role";



GRANT ALL ON TABLE "public"."weekends" TO "anon";
GRANT ALL ON TABLE "public"."weekends" TO "authenticated";
GRANT ALL ON TABLE "public"."weekends" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























drop extension if exists "pg_net";

drop policy "Enable read access for all users" on "public"."candidate_info";

drop policy "Enable read access for all users" on "public"."candidates";


  create policy "Enable read access for all users"
  on "public"."candidate_info"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Enable read access for all users"
  on "public"."candidates"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER on_auth_user_change AFTER INSERT OR DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_users();


  create policy "Enable delete for users based on user_id"
  on "storage"."buckets"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "storage"."buckets"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "storage"."buckets"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);



