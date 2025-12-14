import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase } from '@/lib/results'

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
