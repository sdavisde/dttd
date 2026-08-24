import { test, expect } from './fixtures/payments'
import { PaymentsPage } from './fixtures/payments-page'

/**
 * The bug that started this work: a check written by a sponsor showed only the
 * sponsor's name, so searching the candidate found nothing and the payment
 * looked missing from the admin portal.
 */
test.describe('payments table identifies who a payment is for', () => {
  test('searching the candidate name finds their payment', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()

    await payments.searchFor(testPayment.candidate.name)

    await expect(payments.row(testPayment.id)).toBeVisible()
    await expect(payments.paidFor(testPayment.id)).toContainText(
      testPayment.candidate.name
    )
  })

  test('Paid For is the candidate and Paid By is whoever paid', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()

    await payments.searchFor(testPayment.marker)
    await expect(payments.rows()).toHaveCount(1)

    // The two names are different on purpose — the sponsor paid for the
    // candidate, and conflating them is what made the payment unfindable.
    await expect(payments.paidFor(testPayment.id)).toContainText(
      testPayment.candidate.name
    )
    await expect(payments.paidBy(testPayment.id)).toHaveText(testPayment.paidBy)
  })

  test('searching the payer name also finds the payment', async ({
    page,
    testPayment,
  }) => {
    const payments = new PaymentsPage(page)
    await payments.goto()

    await payments.searchFor(testPayment.paidBy)

    await expect(payments.row(testPayment.id)).toBeVisible()
  })
})
