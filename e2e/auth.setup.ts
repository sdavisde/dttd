import path from 'node:path'
import { test as setup, expect } from '@playwright/test'

const ADMIN_STATE = path.join(__dirname, '.auth/admin.json')

/** Seeded FULL_ACCESS account — see supabase/seed.sql. */
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'sdavisde@gmail.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')

  await page.locator('#email').fill(ADMIN_EMAIL)
  await page.locator('#password').fill(ADMIN_PASSWORD)
  // The page has a mode-toggle "Sign In" button as well, so target the form's
  // submit button rather than matching on the label.
  await page.locator('button[type="submit"]').click()

  // Sign-in redirects away from /login once the session cookie is set. Without
  // waiting, the next navigation races the redirect and bounces back here.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15_000,
  })

  // The payments page is behind READ_PAYMENTS, so reaching it confirms both
  // that the session took and that the seeded role carries the permission.
  // The page renders its title in a breadcrumb rather than a heading, so key
  // off the table's search box.
  await page.goto('/admin/payments')
  await expect(
    page
      .getByPlaceholder(/search by who it was paid for/i)
      .filter({ visible: true })
  ).toBeVisible()

  await page.context().storageState({ path: ADMIN_STATE })
})
