/**
 * Plain object representation of a Stripe price.
 * Used to pass price data from server to client components.
 */
export interface PriceInfo {
  id: string
  unitAmount: number | null
  currency: string
}
