import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { err, fromSupabase, ok } from '@/lib/results'
import { Address } from '@/lib/users/validation'
import { BasicInfo } from '@/components/team-forms/schemas'
import { WeekendReference } from '@/lib/weekend/weekend-reference'

export const GetUserInfoQuery = `
  id,
  first_name,
  last_name,
  gender,
  email,
  phone_number,
  address,
  church_affiliation,
  weekend_attended,
  essentials_training_date,
  special_gifts_and_skills
`

export const JoinUserRolesOnUserId = `
  user_roles:user_roles (
    roles (
      id,
      label,
      permissions
    )
  )
`

export const JoinWeekendRosterOnUserId = `
  weekend_roster:weekend_roster!user_id(
    id, user_id, weekend_id, cha_role, status, weekends(type, status)
  )
`

const GetAllUserInfoQuery = `
  ${GetUserInfoQuery},
  ${JoinUserRolesOnUserId},
  ${JoinWeekendRosterOnUserId}
`

export const getUser = async (userId: string) => {
  const supabase = await createClient()
  const response = await supabase
    .from('users')
    .select(GetAllUserInfoQuery)
    .eq('id', userId)
    .single()
  return fromSupabase(response)
}

export const getAllUsers = async () => {
  const supabase = await createClient()
  const response = await supabase.from('users').select(GetAllUserInfoQuery)
  return fromSupabase(response)
}

export const updateUserRoles = async (userId: string, roleIds: string[]) => {
  const supabase = await createClient()
  const response = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
  if (fromSupabase(response).error) {
    return err('Failed to delete user roles')
  }

  const insertResponse = await supabase
    .from('user_roles')
    .insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })))
    .select()
  return fromSupabase(insertResponse)
}

export const updateUserAddress = async (userId: string, address: Address) => {
  const supabase = await createClient()
  const response = await supabase
    .from('users')
    .update({ address: address })
    .eq('id', userId)
  return fromSupabase(response)
}

export const deleteUser = async (userId: string) => {
  const supabase = await createClient()

  // Delete related records first (foreign key constraints)
  // 1. User Roles
  const deleteRolesResponse = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  if (fromSupabase(deleteRolesResponse).error) {
    return err('Failed to delete user roles')
  }

  // 2. Weekend Roster
  const deleteRosterResponse = await supabase
    .from('weekend_roster')
    .delete()
    .eq('user_id', userId)

  if (fromSupabase(deleteRosterResponse).error) {
    return err('Failed to delete weekend roster')
  }

  // 3. The User
  const deleteUserResponse = await supabase.from('users').delete().eq('id', userId)
  return fromSupabase(deleteUserResponse)
}

export const removeUserRole = async (userId: string) => {
  const supabase = await createClient()
  const response = await supabase.from('user_roles').delete().eq('user_id', userId)
  return fromSupabase(response)
}

export const updateUserBasicInfo = async (userId: string, data: BasicInfo) => {
  const supabase = await createClient()

  const weekendAttendedStr = new WeekendReference(
    data.weekend_attended.community,
    parseInt(data.weekend_attended.weekend_number)
  ).toString()

  const response = await supabase
    .from('users')
    .update({
      church_affiliation: data.church_affiliation,
      weekend_attended: weekendAttendedStr,
      essentials_training_date: data.essentials_training_date
        ? data.essentials_training_date.toISOString()
        : null,
      special_gifts_and_skills: data.special_gifts_and_skills ?? null,
    })
    .eq('id', userId)

  return fromSupabase(response)
}
