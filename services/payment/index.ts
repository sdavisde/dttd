export * from './actions'
export { retrievePrice } from './payment-service'
export type { PaymentRecord, PaymentType } from '@/lib/payments/types'

// New types for payment_transaction table
export type {
  ServiceOptions,
  PriceInfo,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  CreatePaymentInput,
  BackfillStripeDataInput,
  PaymentMethod,
  TargetType,
} from './types'

export {
  PaymentTypeSchema,
  TargetTypeSchema,
  PaymentMethodSchema,
  CreatePaymentSchema,
  BackfillStripeDataSchema,
} from './types'

// Service functions for payment_transaction table (used by webhooks with dangerouslyBypassRLS)
export {
  recordPayment,
  getPaymentForTarget,
  hasPaymentForTarget,
  backfillStripeData,
} from './payment-service'
