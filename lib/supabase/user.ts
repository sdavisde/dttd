'use server'

import { createClient } from '@/lib/supabase/server'
import { User } from './types'
import { isErr } from './utils'

/**
 * Get user with permissions
 * @returns
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('roles(permissions)')
    .eq('user_id', user.id)
    .single()

  if (isErr(userRolesError)) {
    console.error('Error fetching user roles:', userRolesError, user)
    return null
  }

  const { data: userData, error: userDataError } = await supabase.from('users').select('*').eq('id', user.id).single()

  if (isErr(userDataError)) {
    console.error('Error fetching user data:', userDataError)
    return null
  }

  return {
    ...user,
    permissions: userRoles?.roles.permissions ?? [],
    user_metadata: {
      ...user.user_metadata,
      first_name: userData?.first_name || user.user_metadata?.first_name,
      last_name: userData?.last_name || user.user_metadata?.last_name,
      gender: userData?.gender || user.user_metadata?.gender,
    },
  }
}
