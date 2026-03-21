# Task 1.0 Proof Artifacts — Schema Foundation Migrations

## CLI: yarn db:reset

```
$ yarn db:reset
Resetting local database...
Recreating database...
Initialising schema...
Seeding globals from roles.sql...
Applying migration 20260118030550_remote_schema.sql...
Applying migration 20260122183356_add_candidate_payment_fields.sql...
Applying migration 20260127164521_add_site_settings.sql...
Applying migration 20260131195252_add_event_fields.sql...
Applying migration 20260131195300_add_description_and_type_to_roles.sql...
Applying migration 20260203000000_pre_weekend_couple_to_committee.sql...
Applying migration 20260203000001_add_at_large_members_role.sql...
Applying migration 20260205120000_add_stripe_fee_tracking.sql...
Applying migration 20260207120000_add_online_payment_payouts.sql...
Applying migration 20260207200000_create_payment_transaction.sql...
Applying migration 20260207200001_create_deposits_tables.sql...
Applying migration 20260207200002_migrate_payment_data.sql...
Applying migration 20260220200000_drop_deprecated_payment_tables.sql...
Applying migration 20260308000001_weekend_groups.sql...
Applying migration 20260308000002_weekend_group_members.sql...
Applying migration 20260308000003_team_form_completions.sql...
Applying migration 20260308000004_user_medical_profiles.sql...
Seeding data from supabase/seed.sql...
Restarting containers...
Finished supabase db reset on branch main.
```

**Result: ZERO errors. All four new migrations applied cleanly.**

## DB Inspection: Table Row Counts

```sql
SELECT 'weekend_groups' AS tbl, count(*) FROM public.weekend_groups
UNION ALL SELECT 'weekend_group_members', count(*) FROM public.weekend_group_members
UNION ALL SELECT 'team_form_completions', count(*) FROM public.team_form_completions
UNION ALL SELECT 'user_medical_profiles', count(*) FROM public.user_medical_profiles;
```

```
          tbl          | count
-----------------------+-------
 weekend_groups        |     5
 weekend_group_members |     0
 team_form_completions |     0
 user_medical_profiles |     0
```

- `weekend_groups`: 5 rows — one per distinct group_id seeded (groups 42–46) ✅
- `weekend_group_members`: 0 — seed has no roster entries to backfill from ✅
- `team_form_completions`: 0 — no completed forms in seed data ✅
- `user_medical_profiles`: 0 — no medical data in seed data ✅

## DB Inspection: weekend_groups schema

```
                     Table "public.weekend_groups"
   Column   |           Type           | Collation | Nullable | Default
------------+--------------------------+-----------+----------+---------
 id         | uuid                     |           | not null |
 number     | integer                  |           | not null |
 created_at | timestamp with time zone |           |          | now()
```

**Seeded rows (group number populated):**

| id                                   | number |
| ------------------------------------ | ------ |
| d0000001-0000-0000-0000-000000000001 | 42     |
| d0000002-0000-0000-0000-000000000002 | 43     |
| d0000003-0000-0000-0000-000000000003 | 44     |
| d0000004-0000-0000-0000-000000000004 | 45     |
| d0000005-0000-0000-0000-000000000005 | 46     |

## DB Inspection: weekends table (number column dropped)

```
                                   Table "public.weekends"
   Column   |           Type           | Collation | Nullable |            Default
------------+--------------------------+-----------+----------+-------------------------------
 id         | uuid                     |           | not null | gen_random_uuid()
 created_at | timestamp with time zone |           | not null | now()
 type       | weekend_type             |           | not null |
 start_date | date                     |           | not null |
 end_date   | date                     |           | not null |
 title      | text                     |           |          |
 status     | text                     |           |          | ...
 group_id   | uuid                     |           |          |
Foreign-key constraints:
    "weekends_group_id_fkey" FOREIGN KEY (group_id) REFERENCES weekend_groups(id)
```

**`number` column is gone; FK to `weekend_groups` is present. ✅**

## DB Inspection: weekend_roster (form/medical columns dropped)

```
                               Table "public.weekend_roster"
       Column        |           Type           | Collation | Nullable |      Default
---------------------+--------------------------+-----------+----------+-------------------
 created_at          | timestamp with time zone |           | not null | now()
 weekend_id          | uuid                     |           |          |
 user_id             | uuid                     |           |          |
 cha_role            | text                     |           |          |
 id                  | uuid                     |           | not null | gen_random_uuid()
 status              | text                     |           |          |
 rollo               | text                     |           |          |
 additional_cha_role | text                     |           |          |
 special_needs       | text                     |           |          |
```

**Five `completed_*_at` columns removed. Three medical columns removed. `special_needs` remains. ✅**

## Notes

- `yarn db:generate` was run after reset; TypeScript errors exist in application code referencing the dropped columns
- These TS errors are by design and will be resolved in Task 2.0 (Form Completion and Medical Info Service Rework)
- The seed.sql was updated to insert `weekend_groups` rows before `weekends` (FK dependency), and `number` was removed from the `weekends` INSERT
