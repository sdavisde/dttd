import { test, expect } from './fixtures/payments'
import { PaymentsPage } from './fixtures/payments-page'
import { adminClient } from './fixtures/supabase'

test.describe('reassigning a payment to the right person', () => {
  test('moves the payment and its weekend to the new candidate', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)
    await expect(payments.rows()).toHaveCount(1)

    await payments.runRowAction(testPayment.id, 'Reassign')

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Reassign Payment')).toBeVisible()
    await expect(dialog).toContainText(testPayment.candidate.name)

    await dialog.getByRole('combobox').click()
    await page
      .getByPlaceholder('Search by name...')
      .fill(testPayment.otherCandidate.name)
    await page
      .getByRole('option', {
        name: new RegExp(testPayment.otherCandidate.name),
      })
      .first()
      .click()
    await dialog.getByRole('button', { name: 'Reassign Payment' }).click()

    await expect(dialog).toBeHidden()
    await expect(payments.paidFor(testPayment.id)).toContainText(
      testPayment.otherCandidate.name
    )

    // The weekend must follow the target. Nothing on screen shows a stale
    // weekend, but the payment report and the active-weekend financials group
    // on weekend_id, so a stale value silently skews per-weekend totals.
    const { data } = await adminClient()
      .from('payment_transaction')
      .select('target_id, weekend_id')
      .eq('id', testPayment.id)
      .single()

    expect(data?.target_id).toBe(testPayment.otherCandidate.id)
    expect(data?.weekend_id).toBe(testPayment.otherCandidate.weekendId)
    expect(data?.weekend_id).not.toBe(testPayment.candidate.weekendId)
  })

  test('records who made the correction', async ({ page, testPayment }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)

    await payments.runRowAction(testPayment.id, 'Reassign')
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox').click()
    await page
      .getByPlaceholder('Search by name...')
      .fill(testPayment.otherCandidate.name)
    await page
      .getByRole('option', {
        name: new RegExp(testPayment.otherCandidate.name),
      })
      .first()
      .click()
    await dialog.getByRole('button', { name: 'Reassign Payment' }).click()
    await expect(dialog).toBeHidden()

    const { data } = await adminClient()
      .from('payment_transaction')
      .select('updated_at, updated_by')
      .eq('id', testPayment.id)
      .single()

    expect(data?.updated_at).not.toBeNull()
    expect(data?.updated_by).not.toBeNull()
  })

  test('will not reassign a payment to the person it is already on', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()
    await payments.searchFor(testPayment.marker)

    await payments.runRowAction(testPayment.id, 'Reassign')
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox').click()
    await page
      .getByPlaceholder('Search by name...')
      .fill(testPayment.candidate.name)

    // The current target is listed but not selectable.
    await expect(
      page
        .getByRole('option', { name: new RegExp(testPayment.candidate.name) })
        .first()
    ).toBeDisabled()
  })
})
