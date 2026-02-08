import 'server-only'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fromSupabase, Result } from '@/lib/results'
import {
  ServiceOptions,
  PaymentTransactionRow,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  RawPaymentTransaction,
  TargetType,
} from './types'

// ============================================================================
// Client Selection Helper
// ============================================================================

/**
 * Returns the appropriate Supabase client based on service options.
 * When dangerouslyBypassRLS is true, returns an admin client that bypasses RLS.
 * Otherwise, returns a regular client that respects RLS policies.
 */
async function getClient(options?: ServiceOptions) {
  if (options?.dangerouslyBypassRLS) {
    return createAdminClient()
  }
  return createClient()
}

// ============================================================================
// Query Constants
// ============================================================================

/**
 * Query for fetching payment transactions with payer information.
 * Includes left joins to candidates and weekend_roster for payer name/email.
 */
export const PaymentTransactionQuery = `
  id,
  type,
  target_type,
  target_id,
  weekend_id,
  payment_intent_id,
  gross_amount,
  net_amount,
  stripe_fee,
  payment_method,
  payment_owner,
  notes,
  charge_id,
  balance_transaction_id,
  created_at,
  candidates!payment_transaction_target_id_fkey(
    first_name,
    last_name,
    email
  ),
  weekend_roster!payment_transaction_target_id_fkey(
    users(
      first_name,
      last_name,
      email
    )
  )
`

// ============================================================================
// Repository Functions
// ============================================================================

/**
 * Creates a new payment transaction record.
 * @param data - The payment transaction data to insert
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the created payment transaction or an error
 */
export async function createPayment(
  data: PaymentTransactionInsert,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .insert(data)
    .select()
    .single()
  return fromSupabase(response)
}

/**
 * Gets a payment transaction by its ID.
 * @param id - The payment transaction ID
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the payment transaction or an error
 */
export async function getPaymentById(
  id: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow | null>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return fromSupabase(response)
}

/**
 * Gets a payment transaction by Stripe payment intent ID.
 * @param paymentIntentId - The Stripe payment intent ID
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the payment transaction or an error
 */
export async function getPaymentByPaymentIntentId(
  paymentIntentId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow | null>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()
  return fromSupabase(response)
}

/**
 * Gets all payment transactions for a specific target.
 * @param targetType - The type of target ('candidate' or 'weekend_roster')
 * @param targetId - The ID of the target entity
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of payment transactions or an error
 */
export async function getPaymentsByTargetId(
  targetType: NonNullable<TargetType>,
  targetId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow[]>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
  return fromSupabase(response)
}

/**
 * Gets all payment transactions with payer information.
 * Includes joins to candidates and weekend_roster tables for payer name/email.
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of payment transactions with joins or an error
 */
export async function getAllPayments(
  options?: ServiceOptions
): Promise<Result<string, RawPaymentTransaction[]>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select(PaymentTransactionQuery)
    .order('created_at', { ascending: false })
  // This type assertion is necessary because supabase sdk does not recognize the fake FK to candidate or weekend_roster
  // as foreign keys, so it does not recognize the joins
  return fromSupabase(response) as Result<string, RawPaymentTransaction[]>
}

/**
 * Updates a payment transaction record.
 * Primarily used for backfilling Stripe data after charge.updated webhook.
 * @param id - The payment transaction ID to update
 * @param data - The fields to update
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transaction or an error
 */
export async function updatePayment(
  id: string,
  data: PaymentTransactionUpdate,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  return fromSupabase(response)
}

/**
 * Updates a payment transaction by payment intent ID.
 * Used for backfilling Stripe data when we only have the payment intent ID.
 * @param paymentIntentId - The Stripe payment intent ID
 * @param data - The fields to update
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transaction or an error
 */
export async function updatePaymentByPaymentIntentId(
  paymentIntentId: string,
  data: PaymentTransactionUpdate,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update(data)
    .eq('payment_intent_id', paymentIntentId)
    .select()
    .single()
  return fromSupabase(response)
}

// ============================================================================
// Legacy Repository Functions (for backward compatibility during migration)
// ============================================================================

/**
 * Query for fetching team payments from the legacy weekend_roster_payments table.
 * @deprecated Use getAllPayments() from payment_transaction table instead
 */
export const TeamPaymentQuery = `
  id,
  payment_amount,
  payment_method,
  payment_intent_id,
  created_at,
  notes,
  weekend_roster_id,
  stripe_fee,
  net_amount,
  deposited_at,
  payout_id,
  weekend_roster!inner(
    users!inner(
      first_name,
      last_name,
      email
    )
  )
`

/**
 * Raw team payment type from legacy table with joins.
 * @deprecated Use RawPaymentTransaction instead
 */
export type RawTeamPayment = {
  id: string
  payment_amount: number | null
  payment_method: string | null
  payment_intent_id: string
  created_at: string
  notes: string | null
  weekend_roster_id: string
  stripe_fee: number | null
  net_amount: number | null
  deposited_at: string | null
  payout_id: string | null
  weekend_roster: {
    users: {
      first_name: string
      last_name: string
      email: string
    }
  }
}

/**
 * Fetches all team (weekend roster) payments from the legacy table.
 * @deprecated Use getAllPayments() from payment_transaction table instead
 */
export async function getAllTeamPayments(): Promise<
  Result<string, RawTeamPayment[]>
> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_roster_payments')
    .select(TeamPaymentQuery)
    .order('created_at', { ascending: false })
  return fromSupabase(response) as Result<string, RawTeamPayment[]>
}

/**
 * Checks if a payment exists for the given weekend roster ID in the legacy table.
 * @deprecated Use getPaymentsByTargetId('weekend_roster', rosterId) instead
 */
export async function getTeamPaymentByRosterId(
  weekendRosterId: string
): Promise<Result<string, { id: string }[]>> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_roster_payments')
    .select('id')
    .eq('weekend_roster_id', weekendRosterId)
    .limit(1)
  return fromSupabase(response)
}
