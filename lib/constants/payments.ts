/**
 * Payment-related constants for the DTTD application
 */

export const PAYMENT_CONSTANTS = {
  /**
   * Standard team fee amount for weekend participation
   */
  TEAM_FEE: 210,

  /**
   * Standard candidate fee amount for online payment
   */
  CANDIDATE_FEE: 210,

  /**
   * Payment methods supported by the application
   */
  PAYMENT_METHODS: {
    CASH: 'cash',
    CHECK: 'check',
    CARD: 'card',
  } as const,

  /**
   * Payment statuses
   */
  PAYMENT_STATUSES: {
    AWAITING_PAYMENT: 'awaiting_payment',
    PAID: 'paid',
    DROP: 'drop',
  } as const,

  /**
   * Discount applied to manual payments (cash/check) vs online payments
   */
  MANUAL_PAYMENT_DISCOUNT: 10,
} as const

export type PaymentMethod =
  (typeof PAYMENT_CONSTANTS.PAYMENT_METHODS)[keyof typeof PAYMENT_CONSTANTS.PAYMENT_METHODS]
export type PaymentStatus =
  (typeof PAYMENT_CONSTANTS.PAYMENT_STATUSES)[keyof typeof PAYMENT_CONSTANTS.PAYMENT_STATUSES]
