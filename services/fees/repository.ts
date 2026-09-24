import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { fromSupabase, map } from '@/lib/results'
import type { GroupFees } from '@/lib/payments/group-fees'

const GROUP_FEE_COLUMNS =
  'id, number, team_fee, candidate_fee, online_surcharge'

export type RawGroupFeeRow = {
  id: string
  number: number
  team_fee: number | null
  candidate_fee: number | null
  online_surcharge: number | null
}

/** Every weekend group whose fees are set. */
export async function findTrackedGroups(): Promise<
  Result<string, RawGroupFeeRow[]>
> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_groups')
    .select(GROUP_FEE_COLUMNS)
    .not('team_fee', 'is', null)
    .order('number', { ascending: true })

  return fromSupabase(response)
}

/** One group's fee columns; null when the group doesn't exist. */
export async function findGroupFeeRow(
  groupId: string
): Promise<Result<string, RawGroupFeeRow | null>> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_groups')
    .select(GROUP_FEE_COLUMNS)
    .eq('id', groupId)
    .maybeSingle()

  return fromSupabase(response)
}

/**
 * Sets a group's fees. A database trigger enforces MANAGE_FEES (unless the
 * values are the site defaults on a new group) and writes the change log.
 */
export async function updateGroupFees(
  groupId: string,
  fees: GroupFees
): Promise<Result<string, RawGroupFeeRow>> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_groups')
    .update({
      team_fee: fees.teamFee,
      candidate_fee: fees.candidateFee,
      online_surcharge: fees.onlineSurcharge,
    })
    .eq('id', groupId)
    .select(GROUP_FEE_COLUMNS)
    .single()

  return fromSupabase(response)
}

export type RawFeeChange = {
  id: number
  changed_at: string
  old_team_fee: number | null
  new_team_fee: number | null
  old_candidate_fee: number | null
  new_candidate_fee: number | null
  old_online_surcharge: number | null
  new_online_surcharge: number | null
  changedByName: string | null
}

/** A group's fee history, newest first. */
export async function findFeeChanges(
  groupId: string
): Promise<Result<string, RawFeeChange[]>> {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_group_fee_changes')
    .select(
      'id, changed_at, old_team_fee, new_team_fee, old_candidate_fee, new_candidate_fee, old_online_surcharge, new_online_surcharge, users(first_name, last_name)'
    )
    .eq('group_id', groupId)
    .order('changed_at', { ascending: false })

  return map(fromSupabase(response), (rows) =>
    rows.map(({ users, ...row }) => {
      const name = `${users?.first_name ?? ''} ${users?.last_name ?? ''}`.trim()
      return { ...row, changedByName: name !== '' ? name : null }
    })
  )
}
