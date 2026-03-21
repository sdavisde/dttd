import 'server-only'

import { isNil } from 'lodash'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import type {
  RawGroupMember,
  RawFormCompletion,
  RawMedicalProfile,
} from './types'

/**
 * Upserts a weekend_group_members row for a given group and user.
 * Safe to call multiple times — ON CONFLICT DO NOTHING ensures idempotency.
 */
export async function upsertGroupMember(
  groupId: string,
  userId: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_group_members')
    .upsert(
      { group_id: groupId, user_id: userId },
      { onConflict: 'group_id,user_id', ignoreDuplicates: true }
    )

  if (isSupabaseError(error)) {
    return err(`Failed to upsert group member: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Fetches all group members for a given group.
 */
export async function findGroupMembersByGroupId(
  groupId: string
): Promise<Result<string, RawGroupMember[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_group_members')
    .select('*')
    .eq('group_id', groupId)

  if (isSupabaseError(error)) {
    return err(`Failed to fetch group members: ${error.message}`)
  }

  return ok(data ?? [])
}

/**
 * Returns the active group member for a user by joining weekend_group_members
 * through weekend_groups to weekends where status = 'ACTIVE'.
 */
export async function getActiveGroupMemberForUser(
  userId: string
): Promise<Result<string, RawGroupMember | null>> {
  const supabase = await createClient()

  // Find the active weekend group
  const { data: activeWeekends, error: weekendsError } = await supabase
    .from('weekends')
    .select('group_id')
    .eq('status', 'ACTIVE')
    .limit(1)

  if (isSupabaseError(weekendsError)) {
    return err('Failed to fetch active weekends')
  }

  const groupId = activeWeekends?.[0]?.group_id
  if (isNil(groupId)) {
    return ok(null)
  }

  const { data: member, error: memberError } = await supabase
    .from('weekend_group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle()

  if (isSupabaseError(memberError)) {
    return err('Failed to fetch group member')
  }

  return ok(member as RawGroupMember | null)
}

/**
 * Finds a weekend_group_member by its ID.
 * Also fetches a representative weekend_id from the group (for notifications).
 * Uses admin client to bypass RLS — for use in webhook handlers.
 */
export async function getGroupMemberById(
  groupMemberId: string
): Promise<Result<string, RawGroupMember & { weekendId: string | null }>> {
  const supabase = createAdminClient()

  const { data: member, error: memberError } = await supabase
    .from('weekend_group_members')
    .select('*')
    .eq('id', groupMemberId)
    .maybeSingle()

  if (isSupabaseError(memberError) || isNil(member)) {
    return err('Weekend group member not found')
  }

  // Get a weekend_id from the group for notification purposes
  const { data: weekend, error: weekendError } = await supabase
    .from('weekends')
    .select('id')
    .eq('group_id', member.group_id)
    .limit(1)
    .maybeSingle()

  if (isSupabaseError(weekendError)) {
    return err('Failed to fetch weekend for group member')
  }

  return ok({
    ...(member as RawGroupMember),
    weekendId: weekend?.id ?? null,
  })
}

/**
 * Finds the weekend_group_member for a given weekend_roster ID.
 * Joins through weekend_roster → weekends → weekend_group_members.
 */
export async function getGroupMemberByRosterId(
  rosterId: string
): Promise<Result<string, RawGroupMember>> {
  const supabase = await createClient()

  // Step 1: get the roster record's weekend_id and user_id
  const { data: roster, error: rosterError } = await supabase
    .from('weekend_roster')
    .select('weekend_id, user_id')
    .eq('id', rosterId)
    .single()

  if (isSupabaseError(rosterError) || isNil(roster)) {
    return err('Roster record not found')
  }

  if (isNil(roster.weekend_id) || isNil(roster.user_id)) {
    return err('Roster record is missing weekend_id or user_id')
  }

  // Step 2: get the weekend's group_id
  const { data: weekend, error: weekendError } = await supabase
    .from('weekends')
    .select('group_id')
    .eq('id', roster.weekend_id)
    .single()

  if (isSupabaseError(weekendError) || isNil(weekend?.group_id)) {
    return err('Weekend or group_id not found')
  }

  // Step 3: get the group member
  const { data: member, error: memberError } = await supabase
    .from('weekend_group_members')
    .select('*')
    .eq('group_id', weekend.group_id)
    .eq('user_id', roster.user_id)
    .single()

  if (isSupabaseError(memberError) || isNil(member)) {
    return err('Weekend group member not found')
  }

  return ok(member as RawGroupMember)
}

/**
 * Upserts a form completion record for a group member.
 */
export async function upsertFormCompletion(
  groupMemberId: string,
  formType: string,
  completedAt: string
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('team_form_completions').upsert(
    {
      weekend_group_member_id: groupMemberId,
      form_type: formType,
      completed_at: completedAt,
    },
    { onConflict: 'weekend_group_member_id,form_type' }
  )

  if (isSupabaseError(error)) {
    return err(`Failed to upsert form completion: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Returns all form completions for a group member.
 */
export async function getFormCompletions(
  groupMemberId: string
): Promise<Result<string, RawFormCompletion[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_form_completions')
    .select('*')
    .eq('weekend_group_member_id', groupMemberId)

  if (isSupabaseError(error)) {
    return err(`Failed to fetch form completions: ${error.message}`)
  }

  return ok((data ?? []) as RawFormCompletion[])
}

/**
 * Updates special_needs on all weekend_roster rows for the same group and user.
 * Uses admin client to bypass RLS for the multi-row update.
 */
export async function updateSpecialNeedsForGroup(
  groupMemberId: string,
  specialNeeds: string
): Promise<Result<string, void>> {
  const supabase = createAdminClient()

  // Get the group member to find group_id and user_id
  const { data: member, error: memberError } = await supabase
    .from('weekend_group_members')
    .select('group_id, user_id')
    .eq('id', groupMemberId)
    .single()

  if (!isNil(memberError) || isNil(member)) {
    return err('Group member not found')
  }

  // Get all weekend IDs for this group
  const { data: weekends, error: weekendsError } = await supabase
    .from('weekends')
    .select('id')
    .eq('group_id', member.group_id)

  if (!isNil(weekendsError) || isNil(weekends) || weekends.length === 0) {
    return err('No weekends found for group')
  }

  const weekendIds = weekends.map((w) => w.id)

  // Update special_needs on all roster rows for this user in this group
  const { error: updateError } = await supabase
    .from('weekend_roster')
    .update({ special_needs: specialNeeds })
    .eq('user_id', member.user_id)
    .in('weekend_id', weekendIds)

  if (!isNil(updateError)) {
    return err(`Failed to update special_needs: ${updateError.message}`)
  }

  return ok(undefined)
}

/**
 * Fetches the user's medical profile.
 */
export async function getUserMedicalProfile(
  userId: string
): Promise<Result<string, RawMedicalProfile | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_medical_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (isSupabaseError(error)) {
    return err(`Failed to fetch medical profile: ${error.message}`)
  }

  return ok(data as RawMedicalProfile | null)
}

/**
 * Upserts the user's medical profile.
 */
export async function upsertUserMedicalProfile(
  userId: string,
  data: {
    emergency_contact_name: string
    emergency_contact_phone: string
    medical_conditions?: string | null
  }
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('user_medical_profiles').upsert(
    {
      user_id: userId,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      medical_conditions: data.medical_conditions ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (isSupabaseError(error)) {
    return err(`Failed to upsert medical profile: ${error.message}`)
  }

  return ok(undefined)
}
