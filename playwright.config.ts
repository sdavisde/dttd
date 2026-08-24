import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests for the admin payments flows.
 *
 * These run against a real local Supabase (`yarn db:start` + `yarn db:reset`)
 * and the seeded data in `supabase/seed.sql`. They are not part of `yarn test`
 * — see docs/e2e-testing.md for how to run them.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './e2e',
  // Corrections mutate shared rows, so tests within a file run in order and
  // files run one at a time. The suite is small; determinism beats speed here.
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 1 : 0,
  reporter: process.env.CI === 'true' ? 'github' : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Signs in once as the seeded admin and saves the session for every
    // browser test, so individual specs never walk through the login form.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: /\.db\.spec\.ts/,
    },
    {
      // Database-level checks (RLS policies) that talk to Supabase directly
      // and need neither a browser nor a signed-in session.
      name: 'database',
      testMatch: /\.db\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'yarn dev',
    url: BASE_URL,
    reuseExistingServer: process.env.CI !== 'true',
    timeout: 120_000,
  },
})
