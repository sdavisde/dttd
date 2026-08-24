# End-to-end testing

Playwright tests for the admin payments flows live in `e2e/`. They run against
a real local Supabase and the seeded data in `supabase/seed.sql` — they are not
part of `yarn test`, which stays fast and database-free.

## Running them

```bash
yarn db:start          # local Supabase containers
yarn db:reset          # apply migrations + seed (DESTRUCTIVE — local only)
yarn test:e2e
```

`yarn test:e2e` starts `yarn dev` itself and reuses an already-running dev
server if it finds one. First run on a new machine needs the browser binary:

```bash
npx playwright install chromium
```

Other entry points:

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `yarn test:e2e:ui`     | Playwright's watch-mode UI, good for debugging  |
| `yarn test:e2e:report` | Opens the HTML report from the last failing run |

## What they need

`.env.local` must have the local Supabase values, the same ones the dev server
uses (`yarn db:status` prints them):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The fixtures fail with a clear message if any is missing.

Optional overrides: `E2E_BASE_URL` (default `http://127.0.0.1:3000`),
`E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` (default the seeded
`sdavisde@gmail.com` / `password`).

## How they are put together

**Authentication.** A `setup` project signs in once through the real login form
and saves the session to `e2e/.auth/admin.json` (gitignored). Every browser
test reuses it, so no spec walks through login.

**Test data.** The `testPayment` fixture in `e2e/fixtures/payments.ts` inserts
its own `payment_transaction` row with a unique marker written to `notes`, then
deletes it afterwards. Specs mutate the payment they are given — voiding or
reassigning a seeded row would leak into the next run — and search by the
marker to isolate their row in the table.

The fixture also picks two candidates **on different weekends**. Reassign has
to move `weekend_id` along with the target, and that is only observable if the
two candidates belong to different weekends.

**Two kinds of test.** Files ending `.spec.ts` drive the browser. Files ending
`.db.spec.ts` run in a separate `database` project with no browser and no
session — they talk to Supabase directly to check RLS policies. That
separation matters for `payments-permissions.db.spec.ts`: the action layer
already checks `WRITE_PAYMENTS`, so a UI test would pass even if the database
policy were wrong. Only an anon-key client signed in as a real user tests the
policy itself.

## Adding a spec

Import `test` from `./fixtures/payments` rather than `@playwright/test` to get
the `testPayment` fixture, and use the `PaymentsPage` helper in
`e2e/fixtures/payments-page.ts` for locators. The DataTable renders every row
twice — a desktop `<table>` and a mobile card list, both in the DOM with one
hidden by CSS — so locators must be scoped to one or the other. `PaymentsPage`
scopes to the table.

## Cleaning up after a failed run

Fixtures delete what they create, but a hard crash can leave rows behind. They
are all identifiable:

```sql
-- payments created by the fixtures
DELETE FROM payment_transaction WHERE payment_intent_id LIKE 'manual_e2e-%';
-- role created by the RLS spec
DELETE FROM roles WHERE label = 'E2E Read Only Payments';
```

Or just `yarn db:reset`.
