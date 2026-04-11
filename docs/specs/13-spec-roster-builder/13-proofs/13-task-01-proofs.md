# Task 1.0 Proof Artifacts — Draft Roster Data Model & Service Layer

## Database Migration

Migration file: `supabase/migrations/20260411000000_draft_weekend_roster.sql`

Creates `draft_weekend_roster` table with:

- `id` (uuid PK, auto-generated)
- `weekend_id` (uuid FK → weekends, ON DELETE CASCADE)
- `user_id` (uuid FK → users, ON DELETE CASCADE)
- `cha_role` (text, NOT NULL)
- `rollo` (text, nullable)
- `created_by` (uuid FK → users, ON DELETE CASCADE)
- `created_at` (timestamptz, default now())
- `finalized_at` (timestamptz, nullable — set when draft is finalized)
- Unique constraint: `(weekend_id, user_id)`
- RLS enabled with authenticated CRUD policies
- Grants for anon, authenticated, service_role

### Migration Applied Successfully

```
Applying migration 20260411000000_draft_weekend_roster.sql...
Seeding data from supabase/seed.sql...
Finished supabase db reset on branch main.
```

## Type Generation

`yarn db:generate` succeeded. `database.types.ts` includes `draft_weekend_roster` with correct Row/Insert/Update types and FK relationships.

```typescript
draft_weekend_roster: {
  Row: {
    cha_role: string
    created_at: string | null
    created_by: string
    finalized_at: string | null
    id: string
    rollo: string | null
    user_id: string
    weekend_id: string
  }
  // ... Insert and Update types also generated
}
```

## CLI Verification

### TypeScript Compilation

```
$ npx tsc --noEmit
(no output — zero errors)
```

### Lint Check

```
$ yarn lint
```

Only pre-existing errors in `mock-data.ts` (strict-boolean-expressions) and `useReactTable` warning — no new errors introduced by draft roster service layer.

## Service Layer Files Created

| File                                            | Purpose                                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `services/draft-roster/types.ts`                | DTOs: `RawDraftRosterRecord`, `DraftRosterMember`, `RawDraftRosterWithUser`                                                                |
| `services/draft-roster/repository.ts`           | Data access: `insertDraft`, `findDraftsByWeekendId`, `findDraftById`, `deleteDraft`, `markDraftFinalized`                                  |
| `services/draft-roster/draft-roster-service.ts` | Business logic: `addDraftRosterMember`, `getDraftRoster`, `removeDraftRosterMember`, `finalizeDraftRosterMember` with `verifyRectorAccess` |
| `services/draft-roster/actions.ts`              | Server actions: wraps service functions with `'use server'` directive                                                                      |
| `services/draft-roster/index.ts`                | Public API: re-exports actions and types                                                                                                   |

## Architecture Compliance

- **Repository layer**: Pure database queries, returns `Result<string, T>`, uses `createClient()` + `isSupabaseError()`
- **Service layer**: Business logic with rector authorization via `verifyRectorAccess()`, normalized DTOs
- **Actions layer**: `'use server'` directive, delegates to service, re-exports types
- **Finalization flow**: Creates `weekend_roster` row → upserts `weekend_group_members` → archives draft with `finalized_at` timestamp — matches existing `addUserToWeekendRoster` pattern
- **FK hint**: Uses `users!draft_weekend_roster_user_id_fkey` to disambiguate the two user FK relationships
