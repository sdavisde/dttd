-- Add group_member_id FK to weekend_roster so roster rows are directly linked
-- to their weekend_group_members row. This eliminates the indirect join path
-- (weekend_roster → weekends → weekend_groups → weekend_group_members) that
-- previously lost user-scoping and leaked other users' roles/permissions.

-- Step 1: Add the nullable column
ALTER TABLE "public"."weekend_roster"
  ADD COLUMN "group_member_id" uuid;

-- Step 2: Backfill from existing data by joining through weekends → weekend_groups
UPDATE "public"."weekend_roster" AS wr
SET "group_member_id" = wgm.id
FROM "public"."weekends" AS w,
     "public"."weekend_group_members" AS wgm
WHERE wr.weekend_id = w.id
  AND wgm.group_id = w.group_id
  AND wgm.user_id = wr.user_id
  AND wr.group_member_id IS NULL;

-- Step 3: Add FK constraint (nullable — historical rows without a group member are OK)
ALTER TABLE "public"."weekend_roster"
  ADD CONSTRAINT "weekend_roster_group_member_id_fkey"
    FOREIGN KEY ("group_member_id") REFERENCES "public"."weekend_group_members"("id") ON DELETE SET NULL;

-- Step 4: Index for efficient lookups from group member → roster rows
CREATE INDEX "idx_weekend_roster_group_member_id"
  ON "public"."weekend_roster" ("group_member_id");
