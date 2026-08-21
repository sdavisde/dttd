import 'server-only'

import { isNil } from 'lodash'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { fromSupabase, map, ok } from '@/lib/results'
import type {
  ServiceOptions,
  PaymentTransactionRow,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  PaymentTransactionWithWeekend,
  TargetIdentity,
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
  if (options?.dangerouslyBypassRLS === true) {
    return createAdminClient()
  }
  return createClient()
}

/**
 * Builds a display name from a joined users row. Returns null when the user
 * row is missing or has no name on it.
 */
function formatUserName(
  user: { first_name: string | null; last_name: string | null } | null
): string | null {
  if (isNil(user)) return null
  const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
  return name !== '' ? name : null
}

// ============================================================================
// Query Constants
// ============================================================================

/**
 * Query for fetching payment transactions.
 * Note: target_id is a polymorphic UUID without FK constraints, so we cannot
 * use Supabase's join syntax. Payer info is resolved in the service layer.
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
  updated_at,
  updated_by,
  voided_at,
  voided_by,
  void_reason,
  weekends(type, weekend_groups(number))
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
    .is('voided_at', null)
    .order('created_at', { ascending: false })
  return fromSupabase(response)
}

/**
 * Gets all payment transactions.
 * Note: Payer info (name/email) is resolved in the service layer since
 * target_id is a polymorphic UUID without FK constraints.
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of payment transactions or an error
 */
export async function getAllPayments(
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionWithWeekend[]>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select(PaymentTransactionQuery)
    .is('voided_at', null)
    .order('created_at', { ascending: false })
  return fromSupabase(response)
}

/**
 * Gets all payment transactions including voided ones.
 * Voided payments must never reach a total, so this is for the admin payments
 * table only — it renders them struck through behind a toggle so a correction
 * leaves a visible trail. Every other read path uses getAllPayments.
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of payment transactions or an error
 */
export async function getAllPaymentsIncludingVoided(
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionWithWeekend[]>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .select(PaymentTransactionQuery)
    .order('created_at', { ascending: false })
  return fromSupabase(response)
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
 * Reassigns every payment transaction for a target to a different weekend.
 * Used when a candidate is moved between weekends so their payments follow them.
 * @param targetType - The type of target ('candidate' or 'weekend_roster')
 * @param targetId - The ID of the target entity
 * @param weekendId - The weekend to reassign the payments to
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transactions or an error
 */
export async function updatePaymentsWeekendByTarget(
  targetType: NonNullable<TargetType>,
  targetId: string,
  weekendId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow[]>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update({ weekend_id: weekendId })
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .select()
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
// Target Identity Lookups
// ============================================================================

/**
 * Looks up candidate names by candidate ID.
 * Candidate names live on candidate_sponsorship_info, not on the candidates row.
 * @param ids - Candidate IDs to resolve
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the resolved identities (missing IDs are omitted)
 */
export async function getCandidateIdentities(
  ids: string[],
  options?: ServiceOptions
): Promise<Result<string, TargetIdentity[]>> {
  if (ids.length === 0) return ok([])

  const supabase = await getClient(options)
  const response = await supabase
    .from('candidate_sponsorship_info')
    .select('candidate_id, candidate_name, candidate_email')
    .in('candidate_id', ids)

  return map(fromSupabase(response), (rows) =>
    rows
      .filter(
        (row): row is typeof row & { candidate_id: string } =>
          !isNil(row.candidate_id)
      )
      .map((row) => ({
        id: row.candidate_id,
        name: row.candidate_name,
        email: row.candidate_email,
      }))
  )
}

/**
 * Looks up team member names by weekend_group_members ID.
 * @param ids - Group member IDs to resolve
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the resolved identities (missing IDs are omitted)
 */
export async function getGroupMemberIdentities(
  ids: string[],
  options?: ServiceOptions
): Promise<Result<string, TargetIdentity[]>> {
  if (ids.length === 0) return ok([])

  const supabase = await getClient(options)
  const response = await supabase
    .from('weekend_group_members')
    .select('id, users(first_name, last_name, email)')
    .in('id', ids)

  return map(fromSupabase(response), (rows) =>
    rows.map((row) => ({
      id: row.id,
      name: formatUserName(row.users),
      email: row.users?.email ?? null,
    }))
  )
}

/**
 * Looks up team member names by weekend_roster ID.
 * Kept for payments recorded before targets moved to weekend_group_member.
 * @param ids - Roster IDs to resolve
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the resolved identities (missing IDs are omitted)
 */
export async function getRosterIdentities(
  ids: string[],
  options?: ServiceOptions
): Promise<Result<string, TargetIdentity[]>> {
  if (ids.length === 0) return ok([])

  const supabase = await getClient(options)
  const response = await supabase
    .from('weekend_roster')
    .select('id, users(first_name, last_name, email)')
    .in('id', ids)

  return map(fromSupabase(response), (rows) =>
    rows.map((row) => ({
      id: row.id,
      name: formatUserName(row.users),
      email: row.users?.email ?? null,
    }))
  )
}

// ============================================================================
// Correction Mutations
// ============================================================================

/**
 * Reassigns a payment to a different target, moving its weekend with it.
 * @param paymentId - The payment transaction to reassign
 * @param target - The new target type, ID, and derived weekend
 * @param actorId - User performing the correction, stamped as updated_by
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transaction or an error
 */
export async function updatePaymentTarget(
  paymentId: string,
  target: {
    targetType: NonNullable<TargetType>
    targetId: string
    weekendId: string | null
  },
  actorId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update({
      target_type: target.targetType,
      target_id: target.targetId,
      weekend_id: target.weekendId,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    })
    .eq('id', paymentId)
    .select()
    .single()
  return fromSupabase(response)
}

/**
 * Applies a detail correction (amount, method, payer, notes) to a payment.
 * @param paymentId - The payment transaction to correct
 * @param changes - The fields to change; omitted fields are left alone
 * @param actorId - User performing the correction, stamped as updated_by
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transaction or an error
 */
export async function updatePaymentDetails(
  paymentId: string,
  changes: PaymentTransactionUpdate,
  actorId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update({
      ...changes,
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    })
    .eq('id', paymentId)
    .select()
    .single()
  return fromSupabase(response)
}

/**
 * Voids a payment. The row is kept — voided payments are filtered out of
 * balances and totals by the read queries above, not deleted.
 * @param paymentId - The payment transaction to void
 * @param reason - Why the payment is being voided
 * @param actorId - User performing the void, stamped as voided_by
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the voided payment transaction or an error
 */
export async function voidPayment(
  paymentId: string,
  reason: string,
  actorId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('payment_transaction')
    .update({
      voided_at: new Date().toISOString(),
      voided_by: actorId,
      void_reason: reason,
    })
    .eq('id', paymentId)
    .select()
    .single()
  return fromSupabase(response)
}

// ============================================================================
// Reassign Target Options
// ============================================================================

/**
 * Lists every candidate that can receive a payment, with the weekend they are
 * assigned to. Names come from candidate_sponsorship_info.
 * @param options - Service options including RLS bypass flag
 * @returns Result containing candidates with name and weekend info
 */
export async function findCandidateTargets(options?: ServiceOptions): Promise<
  Result<
    string,
    Array<{
      id: string
      name: string | null
      weekendId: string | null
      weekendNumber: number | null
      weekendType: string | null
    }>
  >
> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('candidates')
    .select(
      'id, weekend_id, candidate_sponsorship_info(candidate_name), weekends(type, weekend_groups(number))'
    )

  return map(fromSupabase(response), (rows) =>
    rows.map((row) => ({
      id: row.id,
      name: row.candidate_sponsorship_info.at(0)?.candidate_name ?? null,
      weekendId: row.weekend_id,
      weekendNumber: row.weekends?.weekend_groups?.number ?? null,
      weekendType: row.weekends?.type ?? null,
    }))
  )
}

/**
 * Lists every weekend group member that can receive a payment, with the
 * weekend group they belong to.
 * @param options - Service options including RLS bypass flag
 * @returns Result containing group members with name and group info
 */
export async function findGroupMemberTargets(options?: ServiceOptions): Promise<
  Result<
    string,
    Array<{
      id: string
      name: string | null
      groupNumber: number | null
    }>
  >
> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('weekend_group_members')
    .select('id, weekend_groups(number), users(first_name, last_name)')

  return map(fromSupabase(response), (rows) =>
    rows.map((row) => ({
      id: row.id,
      name: formatUserName(row.users),
      groupNumber: row.weekend_groups?.number ?? null,
    }))
  )
}

/**
 * Looks up the weekend a candidate is assigned to.
 * @param candidateId - The candidate to look up
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the weekend ID, or null when the candidate does
 * not exist (distinguished from a candidate with no weekend by `found`)
 */
export async function findCandidateWeekend(
  candidateId: string,
  options?: ServiceOptions
): Promise<Result<string, { found: boolean; weekendId: string | null }>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('candidates')
    .select('weekend_id')
    .eq('id', candidateId)
    .maybeSingle()

  return map(fromSupabase(response), (row) => ({
    found: !isNil(row),
    weekendId: row?.weekend_id ?? null,
  }))
}

/**
 * Looks up the weekend a roster entry belongs to.
 * @param rosterId - The weekend_roster row to look up
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the weekend ID and whether the row exists
 */
export async function findRosterWeekend(
  rosterId: string,
  options?: ServiceOptions
): Promise<Result<string, { found: boolean; weekendId: string | null }>> {
  const supabase = await getClient(options)
  const response = await supabase
    .from('weekend_roster')
    .select('weekend_id')
    .eq('id', rosterId)
    .maybeSingle()

  return map(fromSupabase(response), (row) => ({
    found: !isNil(row),
    weekendId: row?.weekend_id ?? null,
  }))
}
