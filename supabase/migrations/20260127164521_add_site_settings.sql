CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read settings
CREATE POLICY "Allow authenticated users to select site_settings"
  ON "public"."site_settings" FOR SELECT
  TO "authenticated" USING (true);

-- Any authenticated user can insert settings (app-level permission check via WRITE_SETTINGS)
CREATE POLICY "Allow authenticated users to insert site_settings"
  ON "public"."site_settings" FOR INSERT
  TO "authenticated" WITH CHECK (true);

-- Any authenticated user can update settings (app-level permission check via WRITE_SETTINGS)
CREATE POLICY "Allow authenticated users to update site_settings"
  ON "public"."site_settings" FOR UPDATE
  TO "authenticated" USING (true) WITH CHECK (true);

-- Seed initial values from current hardcoded URLs
INSERT INTO site_settings (key, value) VALUES
  ('mens_prayer_wheel_url', 'https://www.signupgenius.com/go/10C084FA4AC2CA2FEC43-57390609-mens'),
  ('womens_prayer_wheel_url', 'https://www.signupgenius.com/go/10C0E4FACAF22A5FDC34-57382252-womens');
