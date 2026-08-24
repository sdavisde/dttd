import type { Page } from '@playwright/test'
import { test, expect } from './fixtures/payments'
import { PaymentsPage } from './fixtures/payments-page'
import { adminClient } from './fixtures/supabase'

const REASON = 'Check bounced'

/** Voids the payment currently filtered into view. */
async function voidPayment(
  payments: PaymentsPage,
  page: Page,
  paymentId: string
) {
  await payments.runRowAction(paymentId, 'Void')
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Reason').fill(REASON)
  await dialog.getByRole('button', { name: 'Void Payment' }).click()
  await expect(dialog).toBeHidden()
}

test.describe('voiding a payment', () => {
  test('hides it by default and keeps the row on the record', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)
    await expect(payments.rows()).toHaveCount(1)

    await voidPayment(payments, page, testPayment.id)

    await payments.searchFor(testPayment.marker)
    await expect(payments.rows()).toHaveCount(0)

    // Soft, not deleted — a bounced check should leave an explanation behind.
    const { data } = await adminClient()
      .from('payment_transaction')
      .select('voided_at, voided_by, void_reason')
      .eq('id', testPayment.id)
      .single()

    expect(data?.voided_at).not.toBeNull()
    expect(data?.voided_by).not.toBeNull()
    expect(data?.void_reason).toBe(REASON)
  })

  test('reappears with a badge under Show voided', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)
    await voidPayment(payments, page, testPayment.id)

    await payments.showVoidedToggle().check()
    await payments.searchFor(testPayment.marker)

    await expect(payments.row(testPayment.id)).toBeVisible()
    await expect(payments.voidedBadge(testPayment.id)).toBeVisible()
    await expect(payments.voidedBadge(testPayment.id)).toHaveAttribute(
      'title',
      REASON
    )
  })

  test('never counts toward totals, even while shown', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)

    // Before: the filtered summary is exactly this one payment.
    await expect(payments.summaryCount()).toContainText('1 payment')
    await expect(payments.summaryGross()).toHaveText('$123.45')

    await voidPayment(payments, page, testPayment.id)

    await payments.showVoidedToggle().check()
    await payments.searchFor(testPayment.marker)

    // The row is on screen, but its money is gone from the total. The summary
    // hides itself entirely at a count of zero.
    await expect(payments.row(testPayment.id)).toBeVisible()
    await expect(payments.summaryCount()).toBeHidden()
  })
})
