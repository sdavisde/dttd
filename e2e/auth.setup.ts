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
  await page.getByRole('button', { name: /sign in|log in/i }).click()

  // The payments page is behind READ_PAYMENTS, so reaching it confirms both
  // that the session took and that the seeded role carries the permission.
  await page.goto('/admin/payments')
  await expect(
    page.getByRole('heading', { name: /payments/i }).first()
  ).toBeVisible()

  await page.context().storageState({ path: ADMIN_STATE })
})
