import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase, Result } from '@/lib/results'

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
 * Fetches all team (weekend roster) payments from the database.
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
 * Checks if a payment exists for the given weekend roster ID.
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
