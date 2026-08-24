import { expect, type Locator, type Page } from '@playwright/test'

const SEARCH_PLACEHOLDER = /search by who it was paid for/i

/**
 * Helpers for the admin payments table.
 *
 * The DataTable renders every row twice — a desktop `<table>` and a mobile
 * card list, both in the DOM with one hidden by CSS. Everything here scopes to
 * the table so locators stay unambiguous at desktop viewports.
 */
export class PaymentsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/admin/payments')
    await expect(this.searchBox()).toBeVisible()
  }

  /**
   * The toolbar renders twice — desktop and mobile — with one hidden by CSS,
   * so every top-level control has to be narrowed to the visible copy.
   */
  searchBox(): Locator {
    return this.page.getByPlaceholder(SEARCH_PLACEHOLDER).filter({
      visible: true,
    })
  }

  /** Filters the table down to rows matching `text`. */
  async searchFor(text: string): Promise<void> {
    await this.searchBox().fill(text)
  }

  table(): Locator {
    return this.page.getByRole('table')
  }

  /**
   * The data rows currently rendered. Scoped to rows carrying a payment id so
   * the "No payments matching your search." empty-state row is not counted.
   */
  rows(): Locator {
    return this.table().locator('tbody tr:has([data-payment-id])')
  }

  /** The one row for a payment, located by the id stamped on its cell. */
  row(paymentId: string): Locator {
    return this.table().locator('tr', {
      has: this.page.locator(`[data-payment-id="${paymentId}"]`),
    })
  }

  paidFor(paymentId: string): Locator {
    return this.row(paymentId).getByTestId('payment-paid-for')
  }

  paidBy(paymentId: string): Locator {
    return this.row(paymentId).getByTestId('payment-paid-by')
  }

  gross(paymentId: string): Locator {
    return this.row(paymentId).getByTestId('payment-gross')
  }

  voidedBadge(paymentId: string): Locator {
    return this.row(paymentId).getByTestId('payment-voided-badge')
  }

  showVoidedToggle(): Locator {
    return this.page.getByLabel('Show voided').filter({ visible: true })
  }

  summaryCount(): Locator {
    return this.page.getByTestId('payments-summary-count')
  }

  summaryGross(): Locator {
    return this.page.getByTestId('payments-summary-gross')
  }

  /** Opens a row's action menu and clicks one of its items. */
  async runRowAction(
    paymentId: string,
    action: 'Reassign' | 'Edit details' | 'Void'
  ): Promise<void> {
    await this.row(paymentId).getByTestId('payment-actions-trigger').click()
    await this.page.getByRole('menuitem', { name: action }).click()
  }
}
