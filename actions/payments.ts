'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { PaymentRecord } from '@/lib/payments/types'

export async function getAllPayments(): Promise<
  Result<Error, PaymentRecord[]>
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
      return err(new Error(teamError.message))
    }

    // TODO: Implement candidate payments display in admin payments page
    // The candidate_payments table exists but candidate payment flow may need:
    // 1. Review of candidate payment method field (currently missing payment_method column)
    // 2. Verify candidate relationship join works correctly
    // 3. Test payment_owner field population vs candidate name fallback
    // 4. Ensure candidate payment records are being created in the payment flow
    // Uncomment and test the code below once candidate payment system is ready:
    
    // Fetch candidate payments
    // const { data: candidatePayments, error: candidateError } = await supabase
    //   .from('candidate_payments')
    //   .select(
    //     `
    //     id,
    //     payment_amount,
    //     payment_intent_id,
    //     created_at,
    //     payment_owner,
    //     candidate_id,
    //     candidates!inner(
    //       first_name,
    //       last_name,
    //       email
    //     )
    //   `
    //   )
    //   .order('created_at', { ascending: false })

    // if (isSupabaseError(candidateError)) {
    //   logger.error(candidateError, '💢 failed to fetch candidate payments')
    //   return err(new Error(candidateError.message))
    // }

    // Transform and combine payment data
    const combinedPayments: PaymentRecord[] = []

    // Add team fee payments
    if (teamPayments) {
      const transformedTeamPayments = teamPayments.map(
        (payment): PaymentRecord => ({
          id: payment.id,
          type: 'team_fee',
          payment_amount: payment.payment_amount || 0,
          payment_method: payment.payment_method || 'stripe',
          payment_intent_id: payment.payment_intent_id,
          created_at: payment.created_at,
          notes: payment.notes || undefined,
          payer_name: `${payment.weekend_roster.users.first_name} ${payment.weekend_roster.users.last_name}`,
          payer_email: payment.weekend_roster.users.email,
        })
      )
      combinedPayments.push(...transformedTeamPayments)
    }

    // Add candidate payments
    // if (candidatePayments) {
    //   const transformedCandidatePayments = candidatePayments.map(
    //     (payment): PaymentRecord => ({
    //       id: payment.id.toString(),
    //       type: 'candidate_fee',
    //       payment_amount: payment.payment_amount || 0,
    //       payment_method: 'stripe', // Candidate payments are always through Stripe
    //       payment_intent_id: payment.payment_intent_id,
    //       created_at: payment.created_at,
    //       payer_name:
    //         payment.payment_owner ||
    //         `${payment.candidates.first_name} ${payment.candidates.last_name}`,
    //       payer_email: payment.candidates.email,
    //     })
    //   )
    //   combinedPayments.push(...transformedCandidatePayments)
    // }

    // Sort by creation date (newest first)
    combinedPayments.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return ok(combinedPayments)
  } catch (error) {
    logger.error(error, '💢 unexpected error fetching payments')
    return err(new Error('Failed to fetch payment data'))
  }
}
