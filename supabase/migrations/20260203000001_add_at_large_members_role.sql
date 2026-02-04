-- Add At-Large Members role as a committee type
-- General board members who participate in community decisions

INSERT INTO "public"."roles" (id, label, permissions, description, type)
VALUES (
  'a0000011-0000-0000-0000-000000000011',
  'At-Large Members',
  ARRAY[]::text[],
  'General board members who participate in community decisions and initiatives.',
  'COMMITTEE'::role_type
)
ON CONFLICT (id) DO NOTHING;
