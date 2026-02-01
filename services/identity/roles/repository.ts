import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase, ok } from '@/lib/results'
import { Permission } from '@/lib/security'

export const getAllRoles = async () => {
  const supabase = await createClient()
  const response = await supabase.from('roles').select('*').order('label')
  return fromSupabase(response)
}

export const updateRolePermissions = async (
  roleId: string,
  permissions: Permission[]
) => {
  const supabase = await createClient()
  const response = await supabase
    .from('roles')
    .update({ permissions })
    .eq('id', roleId)
  return fromSupabase(response)
}

export const deleteRole = async (roleId: string) => {
  const supabase = await createClient()
  const response = await supabase.from('roles').delete().eq('id', roleId)
  return fromSupabase(response)
}

export const createRole = async (
  label: string,
  permissions: Permission[] = []
) => {
  const supabase = await createClient()
  const response = await supabase
    .from('roles')
    .insert({ label, permissions })
    .select()
    .single()
  return fromSupabase(response)
}

export const updateUserRoles = async (userId: string, roleIds: string[]) => {
  const supabase = await createClient()

  // First delete existing roles
  const deleteResponse = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  if (fromSupabase(deleteResponse).error) {
    return fromSupabase(deleteResponse)
  }

  // Then insert new roles
  const insertResponse = await supabase
    .from('user_roles')
    .insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })))
    .select()
  return fromSupabase(insertResponse)
}

export const removeAllUserRoles = async (userId: string) => {
  const supabase = await createClient()
  const response = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
  return fromSupabase(response)
}

/**
 * Sets the complete list of users assigned to a role.
 * Removes the role from users not in the list and adds it to users in the list.
 */
export const setRoleMembers = async (roleId: string, userIds: string[]) => {
  const supabase = await createClient()

  // First, remove all existing assignments for this role
  const deleteResponse = await supabase
    .from('user_roles')
    .delete()
    .eq('role_id', roleId)

  if (fromSupabase(deleteResponse).error) {
    return fromSupabase(deleteResponse)
  }

  // If no users to assign, we're done
  if (userIds.length === 0) {
    return ok([])
  }

  // Insert new role assignments
  const insertResponse = await supabase
    .from('user_roles')
    .insert(userIds.map((userId) => ({ user_id: userId, role_id: roleId })))
    .select()
  return fromSupabase(insertResponse)
}
