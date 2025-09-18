'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables, TablesInsert, TablesUpdate } from '@/database.types'
import { logger } from '@/lib/logger'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { Weekend, WeekendType } from '@/lib/weekend/types'

export async function getActiveWeekends(): Promise<
  Result<Error, Record<WeekendType, Weekend | null>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('status', 'ACTIVE')

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No active weekend found'))
  }

  return ok({
    MENS: data.find((weekend) => weekend.type === 'MENS') ?? null,
    WOMENS: data.find((weekend) => weekend.type === 'WOMENS') ?? null,
  })
}

/**
 * Fetches a team member's weekend roster record, unless it is already paid for.
 */
export async function getAllWeekends(): Promise<Result<Error, Weekend[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .order('start_date', { ascending: false })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No weekends found'))
  }

  return ok(data as Weekend[])
}

export async function getWeekendById(
  weekendId: string
): Promise<Result<Error, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('id', weekendId)
    .single()

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('Weekend not found'))
  }

  return ok(data as Weekend)
}

type WeekendInsert = TablesInsert<'weekends'>
type WeekendUpdate = TablesUpdate<'weekends'>

export async function createWeekend(
  weekend: Omit<WeekendInsert, 'id' | 'created_at'>
): Promise<Result<Error, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .insert(weekend)
    .select('*')
    .single()

  if (isSupabaseError(error)) {
    return err(new Error(`Failed to create weekend: ${error.message}`))
  }

  if (!data) {
    return err(new Error('Weekend not created'))
  }

  return ok(data as Weekend)
}

export async function updateWeekend(
  weekendId: string,
  updates: Omit<WeekendUpdate, 'id' | 'created_at'>
): Promise<Result<Error, Weekend>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .update(updates)
    .eq('id', weekendId)
    .select('*')
    .single()

  if (isSupabaseError(error)) {
    return err(new Error(`Failed to update weekend: ${error.message}`))
  }

  if (!data) {
    return err(new Error('Weekend not updated'))
  }

  return ok(data as Weekend)
}

export async function deleteWeekend(
  weekendId: string
): Promise<Result<Error, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekends')
    .delete()
    .eq('id', weekendId)

  if (isSupabaseError(error)) {
    return err(new Error(`Failed to delete weekend: ${error.message}`))
  }

  return ok(undefined)
}

export type WeekendRosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
  payment_info: {
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
  } | null
  // Total amount paid from all payment records
  total_paid: number
  // Array of all payment records for this member
  all_payments: Array<{
    id: string
    payment_amount: number | null
    payment_intent_id: string | null
    payment_method: string | null
    created_at: string
    notes: string | null
  }>
}

export async function getWeekendRoster(
  weekendId: string
): Promise<Result<Error, Array<WeekendRosterMember>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(
      `
      id,
      cha_role,
      status,
      weekend_id,
      user_id,
      created_at,
      rollo,
      users (
        id,
        first_name,
        last_name,
        email,
        phone_number
      ),
      weekend_roster_payments (
        id, weekend_roster_id, payment_amount, payment_intent_id, payment_method, created_at, notes
      )
    `
    )
    .eq('weekend_id', weekendId)
    .order('cha_role', { ascending: true })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No roster found for weekend'))
  }

  const normalizedWeekendRoster = data.map((weekend_roster) => {
    const all_payments = weekend_roster.weekend_roster_payments || []
    const total_paid = all_payments.reduce((sum, payment) => {
      return sum + (payment.payment_amount || 0)
    }, 0)

    return {
      ...weekend_roster,
      payment_info: weekend_roster.weekend_roster_payments?.[0] ?? null,
      total_paid,
      all_payments,
    }
  })

  return ok(normalizedWeekendRoster)
}

export async function getAllUsers(): Promise<
  Result<Error, Array<Tables<'users'>>>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_name', { ascending: true })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  if (!data) {
    return err(new Error('No users found'))
  }

  return ok(data)
}

export async function addUserToWeekendRoster(
  weekendId: string,
  userId: string,
  role: string,
  rollo?: string
): Promise<Result<Error, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('weekend_roster').insert({
    weekend_id: weekendId,
    user_id: userId,
    status: 'awaiting_payment',
    cha_role: role,
    rollo: rollo || null,
  })

  if (isSupabaseError(error)) {
    return err(new Error(error?.message))
  }

  return ok(undefined)
}

export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  logger.info(
    `Fetching weekend roster record for team user ID: ${teamUserId} and weekend ID: ${weekendId}`
  )

  if (!teamUserId || !weekendId) {
    return err('💢 Team user ID or weekend ID is null')
  }

  const supabase = await createClient()

  const { data: weekendRosterRecord, error: fetchError } = await supabase
    .from('weekend_roster')
    .select('*')
    .eq('user_id', teamUserId)
    .eq('weekend_id', weekendId)
    .single()

  if (fetchError) {
    return err(fetchError.message)
  }

  if (!weekendRosterRecord) {
    return err('💢 Weekend roster record not found')
  }

  if (weekendRosterRecord.status === 'paid') {
    return err('💢 Weekend roster record is already in status "paid"')
  }

  return ok(weekendRosterRecord)
}

/**
 * Records a manual (cash/check) payment for a weekend roster member
 */
export async function recordManualPayment(
  weekendRosterId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  notes?: string
): Promise<Result<Error, Tables<'weekend_roster_payments'>>> {
  const supabase = await createClient()

  // Verify the weekend roster record exists
  const { data: rosterRecord, error: fetchError } = await supabase
    .from('weekend_roster')
    .select('id')
    .eq('id', weekendRosterId)
    .single()

  if (isSupabaseError(fetchError)) {
    return err(new Error(`Failed to find roster record: ${fetchError.message}`))
  }

  if (!rosterRecord) {
    return err(new Error('Weekend roster record not found'))
  }

  // Insert the payment record
  const { data: paymentRecord, error: insertError } = await supabase
    .from('weekend_roster_payments')
    .insert({
      weekend_roster_id: weekendRosterId,
      payment_amount: paymentAmount,
      payment_method: paymentMethod,
      payment_intent_id: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Generate unique ID for manual payments
      notes: notes ?? null,
      // Note: created_at will be set automatically by Supabase
    })
    .select()
    .single()

  if (isSupabaseError(insertError)) {
    return err(new Error(`Failed to record payment: ${insertError.message}`))
  }

  if (!paymentRecord) {
    return err(new Error('Failed to record payment'))
  }

  logger.info(
    `Manual payment recorded: ${paymentMethod} payment of $${paymentAmount} for roster ID ${weekendRosterId}`
  )

  return ok(paymentRecord)
}
