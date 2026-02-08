import { z } from 'zod'
import { Database } from '@/database.types'

/**
 * Plain object representation of a Stripe price.
 * Used to pass price data from server to client components.
 */
export interface PriceInfo {
  id: string
  unitAmount: number | null
  currency: string
}

// ============================================================================
// Service Options
// ============================================================================

/**
 * Options for service and repository functions.
 * Use dangerouslyBypassRLS ONLY for server-to-server operations like webhooks
 * where there is no user session.
 */
export type ServiceOptions = {
  /**
   * When true, uses an admin Supabase client that bypasses RLS policies.
   * Use ONLY for webhook handlers and system-level operations.
   */
  dangerouslyBypassRLS?: boolean
}

// ============================================================================
// Payment Types (from database)
// ============================================================================

export type PaymentTransactionRow =
  Database['public']['Tables']['payment_transaction']['Row']
export type PaymentTransactionInsert =
  Database['public']['Tables']['payment_transaction']['Insert']
export type PaymentTransactionUpdate =
  Database['public']['Tables']['payment_transaction']['Update']

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

/**
 * Payment type values: fee, donation, or other
 */
export const PaymentTypeSchema = z.enum(['fee', 'donation', 'other'])
export type PaymentType = z.infer<typeof PaymentTypeSchema>

/**
 * Target type values: candidate, weekend_roster, or null (for donations)
 */
export const TargetTypeSchema = z
  .enum(['candidate', 'weekend_roster'])
  .nullable()
export type TargetType = z.infer<typeof TargetTypeSchema>

/**
 * Payment method values: stripe, cash, or check
 */
export const PaymentMethodSchema = z.enum(['stripe', 'cash', 'check'])
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

/**
 * Schema for creating a new payment transaction.
 * Used by recordPayment service function.
 */
export const CreatePaymentSchema = z
  .object({
    type: PaymentTypeSchema,
    target_type: TargetTypeSchema,
    target_id: z.string().uuid().nullable(),
    weekend_id: z.string().uuid().nullable(),
    payment_intent_id: z.string().nullable().optional(),
    gross_amount: z.number().positive('Gross amount must be positive'),
    net_amount: z.number().nullable().optional(),
    stripe_fee: z.number().nullable().optional(),
    payment_method: PaymentMethodSchema,
    payment_owner: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    charge_id: z.string().nullable().optional(),
    balance_transaction_id: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Donations should not have a target
      if (data.type === 'donation') {
        return data.target_type === null && data.target_id === null
      }
      // Fees should have a target
      if (data.type === 'fee') {
        return data.target_type !== null && data.target_id !== null
      }
      // Other types are flexible
      return true
    },
    {
      message:
        'Fees must have target_type and target_id. Donations must not have target_type or target_id.',
    }
  )

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>

/**
 * Schema for updating payment with Stripe data (backfill).
 */
export const BackfillStripeDataSchema = z.object({
  net_amount: z.number().nullable().optional(),
  stripe_fee: z.number().nullable().optional(),
  charge_id: z.string().nullable().optional(),
  balance_transaction_id: z.string().nullable().optional(),
})

export type BackfillStripeDataInput = z.infer<typeof BackfillStripeDataSchema>

// ============================================================================
// Raw Types (from database with joins)
// ============================================================================

/**
 * Raw payment transaction with candidate join for payer info.
 */
export type RawPaymentWithCandidate = PaymentTransactionRow & {
  candidates: {
    first_name: string
    last_name: string
    email: string
  } | null
}

/**
 * Raw payment transaction with weekend roster + user join for payer info.
 */
export type RawPaymentWithRoster = PaymentTransactionRow & {
  weekend_roster: {
    users: {
      first_name: string
      last_name: string
      email: string
    }
  } | null
}

/**
 * Union type for raw payment with any type of payer join.
 */
export type RawPaymentTransaction = PaymentTransactionRow & {
  candidates?: {
    first_name: string
    last_name: string
    email: string
  } | null
  weekend_roster?: {
    users: {
      first_name: string
      last_name: string
      email: string
    }
  } | null
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Normalized payment transaction DTO for frontend consumption.
 */
export type PaymentTransactionDTO = {
  id: string
  type: PaymentType
  target_type: TargetType
  target_id: string | null
  weekend_id: string | null
  payment_intent_id: string | null
  gross_amount: number
  net_amount: number | null
  stripe_fee: number | null
  payment_method: PaymentMethod
  payment_owner: string | null
  notes: string | null
  charge_id: string | null
  balance_transaction_id: string | null
  created_at: string
  // Derived payer info
  payer_name: string | null
  payer_email: string | null
}
