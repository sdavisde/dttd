import { z } from 'zod'
import { isNil } from 'lodash'
import type { Database } from '@/database.types'

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
 * UUID format validator that accepts any UUID-formatted string.
 * Unlike z.string().uuid() which enforces RFC 4122 version/variant bits,
 * this accepts any 8-4-4-4-12 hex string (e.g. seed data UUIDs).
 * The database's uuid type provides canonical validation.
 */
const uuidFormat = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID'
  )

/**
 * Payment type values: fee, donation, or other
 */
export const PaymentTypeSchema = z.enum(['fee', 'donation', 'other'])
export type PaymentType = z.infer<typeof PaymentTypeSchema>

/**
 * Target type values: candidate, weekend_roster, weekend_group_member, or null (for donations)
 */
export const TargetTypeSchema = z
  .enum(['candidate', 'weekend_roster', 'weekend_group_member'])
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
 *
 * `weekend_id` is deliberately absent: it is derived from the target inside
 * recordPayment so no caller can supply a wrong weekend. See
 * resolveTargetWeekend in payment-service.
 */
export const CreatePaymentSchema = z
  .object({
    type: PaymentTypeSchema,
    target_type: TargetTypeSchema,
    target_id: uuidFormat.nullable(),
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

/**
 * Schema for reassigning a payment to a different candidate or team member.
 * The weekend is deliberately not accepted from the caller — it is re-derived
 * from the new target so per-weekend totals stay correct.
 */
export const ReassignPaymentSchema = z.object({
  paymentId: uuidFormat,
  targetType: TargetTypeSchema.unwrap(),
  targetId: uuidFormat,
})

export type ReassignPaymentInput = z.infer<typeof ReassignPaymentSchema>

/**
 * Schema for voiding a payment. A reason is required — the whole point of a
 * soft void is that someone can later see why the balance changed.
 */
export const VoidPaymentSchema = z.object({
  paymentId: uuidFormat,
  reason: z.string().trim().min(1, 'A reason is required to void a payment'),
})

export type VoidPaymentInput = z.infer<typeof VoidPaymentSchema>

/**
 * Schema for correcting a payment's details (a mistyped amount, the wrong
 * method, a misspelled payer). Every field is optional; at least one must be
 * present or there is nothing to do.
 */
export const UpdatePaymentDetailsSchema = z
  .object({
    paymentId: uuidFormat,
    grossAmount: z
      .number()
      .positive('Gross amount must be positive')
      .optional(),
    paymentMethod: PaymentMethodSchema.optional(),
    paymentOwner: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      !isNil(data.grossAmount) ||
      !isNil(data.paymentMethod) ||
      data.paymentOwner !== undefined ||
      data.notes !== undefined,
    { message: 'No changes provided' }
  )

export type UpdatePaymentDetailsInput = z.infer<
  typeof UpdatePaymentDetailsSchema
>

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

/**
 * Identity of a payment's target — the candidate or team member the payment
 * was made for. Resolved separately from the payment query because target_id
 * is a polymorphic UUID with no FK constraint.
 */
export type TargetIdentity = {
  id: string
  name: string | null
  email: string | null
}

/**
 * Raw payment row with joined weekend data from getAllPayments query.
 */
export type PaymentTransactionWithWeekend = PaymentTransactionRow & {
  weekends: {
    type: string
    weekend_groups: { number: number | null } | null
  } | null
}

/**
 * One selectable target in the reassign picker: a candidate or a team member,
 * labelled with the weekend they belong to so same-named people are
 * distinguishable.
 */
export type PaymentTargetOption = {
  targetType: NonNullable<TargetType>
  targetId: string
  name: string
  weekendLabel: string | null
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
  // Correction audit. updated_at/updated_by are stamped by reassign and edit;
  // voided_* are set by a void, which never deletes the row.
  updated_at: string | null
  voided_at: string | null
  void_reason: string | null
  // Resolved from target_type + target_id: the person the payment was made
  // for (the candidate, or the team member). Null when the target can no
  // longer be resolved (deleted record) or for untargeted payments.
  target_name: string | null
  target_email: string | null
  // Joined weekend info. The display label is derived from these — see
  // `formatWeekendLabel` in lib/payments/formatters.
  weekend_number: number | null
  weekend_type: 'MENS' | 'WOMENS' | null
}
