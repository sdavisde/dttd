import { z } from 'zod'
import { Database } from '@/database.types'

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
// Deposit Types (from database)
// ============================================================================

export type DepositRow = Database['public']['Tables']['deposits']['Row']
export type DepositInsert = Database['public']['Tables']['deposits']['Insert']
export type DepositUpdate = Database['public']['Tables']['deposits']['Update']

export type DepositPaymentRow =
  Database['public']['Tables']['deposit_payments']['Row']
export type DepositPaymentInsert =
  Database['public']['Tables']['deposit_payments']['Insert']
export type DepositPaymentUpdate =
  Database['public']['Tables']['deposit_payments']['Update']

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

/**
 * Deposit type values: stripe_payout or manual
 */
export const DepositTypeSchema = z.enum(['stripe_payout', 'manual'])
export type DepositType = z.infer<typeof DepositTypeSchema>

/**
 * Deposit status values matching Stripe payout statuses plus 'completed' for manual deposits
 */
export const DepositStatusSchema = z.enum([
  'pending',
  'in_transit',
  'paid',
  'canceled',
  'failed',
  'completed',
])
export type DepositStatus = z.infer<typeof DepositStatusSchema>

/**
 * Schema for creating a new deposit.
 * Used by recordDeposit service function.
 */
export const CreateDepositSchema = z
  .object({
    deposit_type: DepositTypeSchema,
    amount: z.number().positive('Amount must be positive'),
    status: DepositStatusSchema,
    arrival_date: z.string().datetime().nullable().optional(),
    transaction_count: z.number().int().min(0).optional().default(0),
    payout_id: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Stripe payouts should have a payout_id
      if (data.deposit_type === 'stripe_payout') {
        return data.payout_id !== null && data.payout_id !== undefined
      }
      return true
    },
    {
      message: 'Stripe payout deposits must have a payout_id',
    }
  )

export type CreateDepositInput = z.infer<typeof CreateDepositSchema>

/**
 * Schema for updating a deposit.
 */
export const UpdateDepositSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  status: DepositStatusSchema.optional(),
  arrival_date: z.string().datetime().nullable().optional(),
  transaction_count: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
})

export type UpdateDepositInput = z.infer<typeof UpdateDepositSchema>

/**
 * Schema for linking a payment to a deposit.
 */
export const LinkPaymentSchema = z.object({
  deposit_id: z.string().uuid(),
  payment_transaction_id: z.string().uuid(),
})

export type LinkPaymentInput = z.infer<typeof LinkPaymentSchema>

/**
 * Schema for recording a Stripe payout deposit with linked payments.
 * This is a convenience schema for the webhook handler.
 */
export const RecordStripePayoutSchema = z.object({
  payout_id: z.string(),
  amount: z.number().positive('Amount must be positive'),
  status: DepositStatusSchema,
  arrival_date: z.string().datetime().nullable().optional(),
  payment_intent_ids: z.array(z.string()),
})

export type RecordStripePayoutInput = z.infer<typeof RecordStripePayoutSchema>

// ============================================================================
// Raw Types (from database with joins)
// ============================================================================

/**
 * Raw deposit with linked payment transactions.
 */
export type RawDepositWithPayments = DepositRow & {
  deposit_payments: Array<{
    id: string
    payment_transaction_id: string
    payment_transaction: {
      id: string
      type: string
      gross_amount: number
      payment_method: string
      created_at: string | null
    }
  }>
}

/**
 * Raw deposit payment link with payment transaction data.
 */
export type RawDepositPaymentWithTransaction = DepositPaymentRow & {
  payment_transaction: {
    id: string
    type: string
    target_type: string | null
    target_id: string | null
    gross_amount: number
    net_amount: number | null
    stripe_fee: number | null
    payment_method: string
    created_at: string | null
  }
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Normalized deposit DTO for frontend consumption.
 * Includes computed fields for payment summary.
 */
export type DepositDTO = {
  id: string
  deposit_type: DepositType
  amount: number
  status: DepositStatus
  arrival_date: Date | null
  transaction_count: number
  payout_id: string | null
  notes: string | null
  created_at: Date
  // Computed fields
  payment_count: number
  total_gross_amount: number
}

/**
 * Deposit payment link DTO with basic payment info.
 */
export type DepositPaymentDTO = {
  id: string
  deposit_id: string
  payment_transaction_id: string
  created_at: Date
  // Payment info
  payment_type: string
  payment_gross_amount: number
  payment_method: string
  payment_created_at: Date
}
