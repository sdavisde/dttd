'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { Tables } from '@/database.types'

export type UserWithRole = {
  id: string
  first_name: string | null
  last_name: string | null
  gender: string | null
  role: Tables<'roles'> | null
}

export async function getUsersWithRoles(): Promise<Result<Error, UserWithRole[]>> {
  try {
    const supabase = await createClient()

    // 1. Get all user roles with role details
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, roles(*)')

    if (userRolesError) {
      return err(new Error(`Failed to fetch user roles: ${userRolesError.message}`))
    }

    // 2. Get user profile data from public.users table
    const { data: publicUsers, error: publicUsersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, gender')

    if (publicUsersError) {
      return err(new Error(`Failed to fetch users: ${publicUsersError.message}`))
    }

    // 3. Combine users with their roles
    const usersWithRoles: UserWithRole[] = publicUsers.map(user => {
      const userRole = userRoles.find(ur => ur.user_id === user.id)
      
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        role: userRole?.roles || null
      }
    })

    return ok(usersWithRoles)
  } catch (error) {
    return err(
      new Error(
        `Error while fetching users with roles: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function assignUserRole(
  userId: string,
  roleId: string
): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    // Check if user already has a role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      return err(new Error(`Failed to check existing role: ${checkError.message}`))
    }

    if (existingRole) {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role_id: roleId })
        .eq('user_id', userId)

      if (updateError) {
        return err(new Error(`Failed to update user role: ${updateError.message}`))
      }
    } else {
      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId })

      if (insertError) {
        return err(new Error(`Failed to assign user role: ${insertError.message}`))
      }
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      new Error(
        `Error while assigning user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function removeUserRole(userId: string): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      return err(new Error(`Failed to remove user role: ${error.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      new Error(
        `Error while removing user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

