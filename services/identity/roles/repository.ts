import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase } from '@/lib/results'
import { Permission } from '@/lib/security'

export const getAllRoles = async () => {
  const supabase = await createClient()
  const response = await supabase
    .from('roles')
    .select('*')
    .order('label')
  return fromSupabase(response)
}

export const updateRolePermissions = async (roleId: string, permissions: Permission[]) => {
  const supabase = await createClient()
  const response = await supabase
    .from('roles')
    .update({ permissions })
    .eq('id', roleId)
  return fromSupabase(response)
}

export const deleteRole = async (roleId: string) => {
  const supabase = await createClient()
  const response = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)
  return fromSupabase(response)
}

export const createRole = async (label: string, permissions: Permission[] = []) => {
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
