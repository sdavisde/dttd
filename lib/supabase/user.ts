'use server'

import { createClient } from '@/lib/supabase/server'
import { User } from './types'

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

  if (userRolesError) {
    console.error('Error fetching user roles:', userRolesError)
    return null
  }

  return {
    ...user,
    permissions: userRoles?.roles.permissions ?? [],
  }
}
