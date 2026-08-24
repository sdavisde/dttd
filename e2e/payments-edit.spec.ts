import { test, expect } from './fixtures/payments'
import { PaymentsPage } from './fixtures/payments-page'
import { adminClient } from './fixtures/supabase'

test.describe('correcting a payment', () => {
  test('saves a corrected amount', async ({ page, testPayment }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)
    await expect(payments.gross(testPayment.id)).toHaveText('$123.45')

    await payments.runRowAction(testPayment.id, 'Edit details')
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Amount').fill('250')
    await dialog.getByRole('button', { name: 'Save Changes' }).click()
    await expect(dialog).toBeHidden()

    await payments.searchFor(testPayment.marker)
    await expect(payments.gross(testPayment.id)).toHaveText('$250.00')

    const { data } = await adminClient()
      .from('payment_transaction')
      .select('gross_amount')
      .eq('id', testPayment.id)
      .single()

    expect(Number(data?.gross_amount)).toBe(250)
  })

  test('saves a corrected payer name', async ({ page, testPayment }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)

    await payments.runRowAction(testPayment.id, 'Edit details')
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Paid By').fill('Corrected Payer')
    await dialog.getByRole('button', { name: 'Save Changes' }).click()
    await expect(dialog).toBeHidden()

    await payments.searchFor(testPayment.marker)
    await expect(payments.paidBy(testPayment.id)).toHaveText('Corrected Payer')
  })

  test('rejects a non-positive amount', async ({ page, testPayment }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)

    await payments.runRowAction(testPayment.id, 'Edit details')
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Amount').fill('0')

    // gross_amount > 0 is a CHECK constraint; the form blocks it before the
    // database has to.
    await expect(
      dialog.getByRole('button', { name: 'Save Changes' })
    ).toBeDisabled()
  })
})
