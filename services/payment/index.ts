export * from './actions'
export { retrievePrice } from './payment-service'
export type { PaymentRecord, PaymentType } from '@/lib/payments/types'

// New types for payment_transaction table
export type {
  ServiceOptions,
  PriceInfo,
  PaymentTargetOption,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  CreatePaymentInput,
  BackfillStripeDataInput,
  PaymentMethod,
  TargetType,
} from './types'

export type {
  ReassignPaymentInput,
  UpdatePaymentDetailsInput,
  VoidPaymentInput,
} from './types'

export {
  PaymentTypeSchema,
  TargetTypeSchema,
  PaymentMethodSchema,
  CreatePaymentSchema,
  BackfillStripeDataSchema,
  ReassignPaymentSchema,
  UpdatePaymentDetailsSchema,
  VoidPaymentSchema,
} from './types'

// Service functions for payment_transaction table (used by webhooks with dangerouslyBypassRLS)
export {
  recordPayment,
  getPaymentForTarget,
  hasPaymentForTarget,
  backfillStripeData,
} from './payment-service'

export type { ActiveWeekendFinancials } from '@/lib/payments/compute-totals'
