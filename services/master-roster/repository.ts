import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase } from '@/lib/results'

const GetMasterRosterQuery = `
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
  special_gifts_and_skills,
  user_roles:user_roles (
    roles (
      id,
      label,
      permissions
    )
  ),
  users_experience (
    id,
    user_id,
    weekend_id,
    cha_role,
    weekend_reference,
    rollo,
    created_at,
    updated_at
  )
`

export async function getMasterRoster() {
  const supabase = await createClient()
  const response = await supabase
    .from('users')
    .select(GetMasterRosterQuery)
    .order('last_name', { ascending: true })

  return fromSupabase(response)
}

const GetWeekendRosterWithExperienceQuery = `
  id,
  user_id,
  status,
  users (
    id,
    users_experience (
      id,
      user_id,
      weekend_id,
      weekend_reference
    )
  )
`

export async function getWeekendRosterWithExperience(weekendId: string) {
  const supabase = await createClient()
  const response = await supabase
    .from('weekend_roster')
    .select(GetWeekendRosterWithExperienceQuery)
    .eq('weekend_id', weekendId)

  return fromSupabase(response)
}
