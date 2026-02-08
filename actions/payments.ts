'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { PaymentRecord } from '@/lib/payments/types'

/**
 * Checks if a team member has made any payment for the given weekend roster.
 */
export async function hasTeamPayment(
  weekendRosterId: string
): Promise<Result<string, boolean>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster_payments')
    .select('id')
    .eq('weekend_roster_id', weekendRosterId)
    .limit(1)

  if (isSupabaseError(error)) {
    logger.error(error, '💢 failed to check team payment status')
    return err(error.message)
  }

  return ok(data !== null && data.length > 0)
}

/**
 * @deprecated Use getAllPayments from @/services/payment after Task 8.0 updates the admin display
 */
export async function getAllPaymentsDeprecated(): Promise<
  Result<string, PaymentRecord[]>
> {
  const supabase = await createClient()

  try {
    // Fetch weekend roster payments (team fees)
    const { data: teamPayments, error: teamError } = await supabase
      .from('weekend_roster_payments')
      .select(
        `
        id,
        payment_amount,
        payment_method,
        payment_intent_id,
        created_at,
        notes,
        weekend_roster_id,
        weekend_roster!inner(
          users!inner(
            first_name,
            last_name,
            email
          )
        )
      `
      )
      .order('created_at', { ascending: false })

    if (isSupabaseError(teamError)) {
      logger.error(teamError, '💢 failed to fetch team payments')
      return err(teamError.message)
    }

    // Fetch candidate payments
    // Join through candidates -> candidate_info to get name/email
    const { data: candidatePayments, error: candidateError } = await supabase
      .from('candidate_payments')
      .select(
        `
        id,
        payment_amount,
        payment_method,
        payment_intent_id,
        created_at,
        notes,
        payment_owner,
        candidate_id,
        candidates!inner(
          candidate_info(
            first_name,
            last_name,
            email
          )
        )
      `
      )
      .order('created_at', { ascending: false })

    if (isSupabaseError(candidateError)) {
      logger.error(candidateError, '💢 failed to fetch candidate payments')
      return err(candidateError.message)
    }

    // Transform and combine payment data
    const combinedPayments: PaymentRecord[] = []

    // Add team fee payments
    if (teamPayments) {
      const transformedTeamPayments = teamPayments.map(
        (payment): PaymentRecord => ({
          id: payment.id,
          type: 'team_fee',
          payment_amount: payment.payment_amount ?? 0,
          payment_method: payment.payment_method ?? 'stripe',
          payment_intent_id: payment.payment_intent_id,
          created_at: payment.created_at,
          notes: payment.notes ?? undefined,
          payer_name: `${payment.weekend_roster.users.first_name} ${payment.weekend_roster.users.last_name}`,
          payer_email: payment.weekend_roster.users.email,
          // Fee/deposit tracking not yet implemented in database
          stripe_fee: null,
          net_amount: null,
          deposited_at: null,
          payout_id: null,
        })
      )
      combinedPayments.push(...transformedTeamPayments)
    }

    // Add candidate payments
    if (candidatePayments) {
      const transformedCandidatePayments = candidatePayments.map(
        (payment): PaymentRecord => {
          const candidateInfo = payment.candidates.candidate_info[0]
          return {
            id: payment.id.toString(),
            type: 'candidate_fee',
            payment_amount: payment.payment_amount ?? 0,
            payment_method: payment.payment_method ?? 'stripe',
            payment_intent_id: payment.payment_intent_id,
            created_at: payment.created_at,
            notes: payment.notes ?? undefined,
            payer_name:
              payment.payment_owner ||
              (candidateInfo
                ? `${candidateInfo.first_name} ${candidateInfo.last_name}`
                : 'Unknown'),
            payer_email: candidateInfo?.email ?? null,
            // Fee/deposit tracking not yet implemented in database
            stripe_fee: null,
            net_amount: null,
            deposited_at: null,
            payout_id: null,
          }
        }
      )
      combinedPayments.push(...transformedCandidatePayments)
    }

    // Sort by creation date (newest first)
    combinedPayments.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return ok(combinedPayments)
  } catch (error) {
    logger.error(error, '💢 unexpected error fetching payments')
    return err('Failed to fetch payment data')
  }
}
