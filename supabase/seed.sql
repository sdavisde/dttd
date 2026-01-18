-- =============================================================================
-- DTTD Seed Data
-- =============================================================================
-- This file seeds the database with test data for local development.
-- Run with: supabase db reset (which runs migrations then seed.sql)
-- =============================================================================

-- =============================================================================
-- SECTION: Roles
-- =============================================================================
-- Create the default roles for the application

INSERT INTO public.roles (id, label, permissions) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Full Access', ARRAY['FULL_ACCESS']),
  ('a0000002-0000-0000-0000-000000000002', 'Leaders Committee', ARRAY['DELETE_CANDIDATES', 'FILES_DELETE', 'FILES_UPLOAD', 'READ_ADMIN_PORTAL', 'READ_CANDIDATES', 'READ_DROPPED_ROSTER', 'READ_EVENTS', 'READ_PAYMENTS', 'READ_USERS', 'READ_USER_EXPERIENCE', 'READ_USER_ROLES', 'READ_WEEKENDS', 'WRITE_CANDIDATES', 'WRITE_EVENTS', 'WRITE_PAYMENTS', 'WRITE_TEAM_ROSTER', 'WRITE_USER_ROLES', 'WRITE_WEEKENDS']),
  ('a0000003-0000-0000-0000-000000000003', 'Admin', ARRAY['FILES_DELETE', 'FILES_UPLOAD', 'READ_ADMIN_PORTAL', 'READ_CANDIDATES', 'READ_DROPPED_ROSTER', 'READ_WEEKENDS']),
  ('a0000004-0000-0000-0000-000000000004', 'Pre Weekend Couple', ARRAY['READ_CANDIDATES', 'WRITE_CANDIDATES', 'DELETE_CANDIDATES']),
  ('a0000005-0000-0000-0000-000000000005', 'Corresponding Secretary', ARRAY['READ_ADMIN_PORTAL', 'READ_CANDIDATES', 'READ_MEETINGS', 'READ_USERS', 'READ_USER_EXPERIENCE', 'READ_WEEKENDS', 'WRITE_MEETINGS', 'WRITE_TEAM_ROSTER', 'WRITE_USER_ROLES', 'WRITE_WEEKENDS']),
  ('a0000006-0000-0000-0000-000000000006', 'President', ARRAY['READ_ADMIN_PORTAL', 'READ_CANDIDATES', 'READ_DROPPED_ROSTER', 'READ_MEETINGS', 'READ_PAYMENTS', 'READ_USERS', 'READ_USER_EXPERIENCE', 'READ_WEEKENDS']),
  ('a0000007-0000-0000-0000-000000000007', 'Vice President', ARRAY['READ_ADMIN_PORTAL', 'READ_CANDIDATES', 'READ_DROPPED_ROSTER', 'READ_MEETINGS', 'READ_PAYMENTS', 'READ_USERS', 'READ_USER_EXPERIENCE', 'READ_WEEKENDS']),
  ('a0000008-0000-0000-0000-000000000008', 'Treasurer', ARRAY['READ_PAYMENTS']),
  ('a0000009-0000-0000-0000-000000000009', 'Recording Secretary', ARRAY[]::text[]),
  ('a0000010-0000-0000-0000-000000000010', 'Community Spiritual Director', ARRAY['WRITE_COMMUNITY_ENCOURAGEMENT']);

-- =============================================================================
-- SECTION: Auth Users (auth.users table)
-- =============================================================================
-- These are the Supabase auth users that will be synced to public.users
-- Password for all users: "password"

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
  -- User 1: sdavisde@gmail.com (Admin)
  (
    'b0000001-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sdavisde@gmail.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Sean", "last_name": "Davis", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 2: nick44fierro@gmail.com (Admin)
  (
    'b0000002-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nick44fierro@gmail.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Nick", "last_name": "Fierro", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 3
  (
    'b0000003-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'john.smith@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "John", "last_name": "Smith", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 4
  (
    'b0000004-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jane.doe@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Jane", "last_name": "Doe", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 5
  (
    'b0000005-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'michael.johnson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Michael", "last_name": "Johnson", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 6
  (
    'b0000006-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sarah.williams@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Sarah", "last_name": "Williams", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 7
  (
    'b0000007-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'david.brown@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "David", "last_name": "Brown", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 8
  (
    'b0000008-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'emily.jones@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Emily", "last_name": "Jones", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 9
  (
    'b0000009-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'james.garcia@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "James", "last_name": "Garcia", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 10
  (
    'b0000010-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'amanda.martinez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Amanda", "last_name": "Martinez", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 11
  (
    'b0000011-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'robert.rodriguez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Robert", "last_name": "Rodriguez", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 12
  (
    'b0000012-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jessica.hernandez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Jessica", "last_name": "Hernandez", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 13
  (
    'b0000013-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'william.lopez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "William", "last_name": "Lopez", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 14
  (
    'b0000014-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ashley.gonzalez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Ashley", "last_name": "Gonzalez", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 15
  (
    'b0000015-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'christopher.wilson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Christopher", "last_name": "Wilson", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 16
  (
    'b0000016-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jennifer.anderson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Jennifer", "last_name": "Anderson", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 17
  (
    'b0000017-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'matthew.thomas@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Matthew", "last_name": "Thomas", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 18
  (
    'b0000018-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'stephanie.taylor@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Stephanie", "last_name": "Taylor", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 19
  (
    'b0000019-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'daniel.moore@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Daniel", "last_name": "Moore", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 20
  (
    'b0000020-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'michelle.jackson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Michelle", "last_name": "Jackson", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 21
  (
    'b0000021-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'andrew.martin@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Andrew", "last_name": "Martin", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 22
  (
    'b0000022-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'kimberly.lee@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Kimberly", "last_name": "Lee", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 23
  (
    'b0000023-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'joshua.perez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Joshua", "last_name": "Perez", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 24
  (
    'b0000024-0000-0000-0000-000000000024',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'melissa.thompson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Melissa", "last_name": "Thompson", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 25
  (
    'b0000025-0000-0000-0000-000000000025',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'kevin.white@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Kevin", "last_name": "White", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 26
  (
    'b0000026-0000-0000-0000-000000000026',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'laura.harris@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Laura", "last_name": "Harris", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 27
  (
    'b0000027-0000-0000-0000-000000000027',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'brian.sanchez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Brian", "last_name": "Sanchez", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 28
  (
    'b0000028-0000-0000-0000-000000000028',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nicole.clark@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Nicole", "last_name": "Clark", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 29
  (
    'b0000029-0000-0000-0000-000000000029',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ryan.ramirez@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Ryan", "last_name": "Ramirez", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 30
  (
    'b0000030-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'heather.lewis@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Heather", "last_name": "Lewis", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 31
  (
    'b0000031-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'justin.robinson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Justin", "last_name": "Robinson", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 32
  (
    'b0000032-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rachel.walker@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Rachel", "last_name": "Walker", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 33
  (
    'b0000033-0000-0000-0000-000000000033',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'brandon.young@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Brandon", "last_name": "Young", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 34
  (
    'b0000034-0000-0000-0000-000000000034',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'amber.allen@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Amber", "last_name": "Allen", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 35
  (
    'b0000035-0000-0000-0000-000000000035',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tyler.king@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Tyler", "last_name": "King", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 36
  (
    'b0000036-0000-0000-0000-000000000036',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'megan.wright@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Megan", "last_name": "Wright", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 37
  (
    'b0000037-0000-0000-0000-000000000037',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'aaron.scott@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Aaron", "last_name": "Scott", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 38
  (
    'b0000038-0000-0000-0000-000000000038',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'christina.torres@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Christina", "last_name": "Torres", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 39
  (
    'b0000039-0000-0000-0000-000000000039',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'adam.nguyen@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Adam", "last_name": "Nguyen", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 40
  (
    'b0000040-0000-0000-0000-000000000040',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'samantha.hill@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Samantha", "last_name": "Hill", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 41
  (
    'b0000041-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nathan.flores@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Nathan", "last_name": "Flores", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 42
  (
    'b0000042-0000-0000-0000-000000000042',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'victoria.green@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Victoria", "last_name": "Green", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 43
  (
    'b0000043-0000-0000-0000-000000000043',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'eric.adams@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Eric", "last_name": "Adams", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 44
  (
    'b0000044-0000-0000-0000-000000000044',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tiffany.nelson@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Tiffany", "last_name": "Nelson", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 45
  (
    'b0000045-0000-0000-0000-000000000045',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jacob.baker@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Jacob", "last_name": "Baker", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 46
  (
    'b0000046-0000-0000-0000-000000000046',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'brittany.hall@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Brittany", "last_name": "Hall", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 47
  (
    'b0000047-0000-0000-0000-000000000047',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'samuel.rivera@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Samuel", "last_name": "Rivera", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 48
  (
    'b0000048-0000-0000-0000-000000000048',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'katherine.campbell@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Katherine", "last_name": "Campbell", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 49
  (
    'b0000049-0000-0000-0000-000000000049',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'patrick.mitchell@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Patrick", "last_name": "Mitchell", "gender": "Male"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- User 50
  (
    'b0000050-0000-0000-0000-000000000050',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'elizabeth.carter@example.com',
    extensions.crypt('password', extensions.gen_salt('bf')),
    now(),
    '{"first_name": "Elizabeth", "last_name": "Carter", "gender": "Female"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

-- =============================================================================
-- SECTION: Auth Identities (auth.identities table)
-- =============================================================================
-- Required for Supabase auth to work properly with email/password login

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  id,
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users;

-- =============================================================================
-- SECTION: User Roles (Assign roles to primary users)
-- =============================================================================
-- Give sdavisde@gmail.com and nick44fierro@gmail.com Full Access

INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'), -- Sean Davis - Full Access
  ('b0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001'); -- Nick Fierro - Full Access

-- =============================================================================
-- SECTION: Update Public Users with Additional Data
-- =============================================================================
-- The sync_users trigger creates basic records, but we can add more detail

UPDATE public.users SET
  phone_number = '555-123-4567',
  church_affiliation = 'First Baptist Church',
  weekend_attended = 'DTTD Mens #42'
WHERE id = 'b0000001-0000-0000-0000-000000000001';

UPDATE public.users SET
  phone_number = '555-234-5678',
  church_affiliation = 'Grace Community Church',
  weekend_attended = 'DTTD Mens #40'
WHERE id = 'b0000002-0000-0000-0000-000000000002';

-- Add some variety to other users
UPDATE public.users SET
  phone_number = numbered.phone,
  church_affiliation = numbered.church,
  weekend_attended = numbered.weekend
FROM (
  SELECT
    id,
    gender,
    '555-' || LPAD((100 + rn)::text, 3, '0') || '-' || LPAD((1000 + rn)::text, 4, '0') AS phone,
    CASE rn % 5
      WHEN 0 THEN 'First Baptist Church'
      WHEN 1 THEN 'Grace Community Church'
      WHEN 2 THEN 'St. Mary''s Catholic Church'
      WHEN 3 THEN 'Trinity Methodist Church'
      WHEN 4 THEN 'Crossroads Bible Church'
    END AS church,
    CASE
      WHEN gender = 'Male' THEN 'DTTD Mens #' || (35 + rn % 10)::text
      ELSE 'DTTD Womens #' || (35 + rn % 10)::text
    END AS weekend
  FROM (
    SELECT id, gender, ROW_NUMBER() OVER () AS rn
    FROM public.users
    WHERE id NOT IN ('b0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002')
  ) AS numbered_inner
) AS numbered
WHERE public.users.id = numbered.id;

-- =============================================================================
-- SECTION: Weekends
-- =============================================================================
-- Create 5 weekend groups (10 total records - Men's and Women's for each)
-- 3 past (FINISHED), 1 current (ACTIVE), 1 future (PLANNING)

INSERT INTO public.weekends (id, group_id, type, number, title, start_date, end_date, status) VALUES
  -- Weekend Group 1: FINISHED (Spring 2024)
  ('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'MENS', 42, 'DTTD Mens #42', '2024-03-14', '2024-03-17', 'FINISHED'),
  ('c0000002-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'WOMENS', 42, 'DTTD Womens #42', '2024-03-14', '2024-03-17', 'FINISHED'),

  -- Weekend Group 2: FINISHED (Fall 2024)
  ('c0000003-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'MENS', 43, 'DTTD Mens #43', '2024-09-19', '2024-09-22', 'FINISHED'),
  ('c0000004-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'WOMENS', 43, 'DTTD Womens #43', '2024-09-19', '2024-09-22', 'FINISHED'),

  -- Weekend Group 3: FINISHED (Spring 2025)
  ('c0000005-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 'MENS', 44, 'DTTD Mens #44', '2025-03-13', '2025-03-16', 'FINISHED'),
  ('c0000006-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 'WOMENS', 44, 'DTTD Womens #44', '2025-03-13', '2025-03-16', 'FINISHED'),

  -- Weekend Group 4: ACTIVE (Fall 2025 - current)
  ('c0000007-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004', 'MENS', 45, 'DTTD Mens #45', '2025-09-18', '2025-09-21', 'ACTIVE'),
  ('c0000008-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004', 'WOMENS', 45, 'DTTD Womens #45', '2025-09-18', '2025-09-21', 'ACTIVE'),

  -- Weekend Group 5: PLANNING (Spring 2026 - future)
  ('c0000009-0000-0000-0000-000000000005', 'd0000005-0000-0000-0000-000000000005', 'MENS', 46, 'DTTD Mens #46', '2026-03-12', '2026-03-15', 'PLANNING'),
  ('c0000010-0000-0000-0000-000000000005', 'd0000005-0000-0000-0000-000000000005', 'WOMENS', 46, 'DTTD Womens #46', '2026-03-12', '2026-03-15', 'PLANNING');
