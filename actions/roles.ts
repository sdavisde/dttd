'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { Tables } from '@/database.types'

export type Role = Tables<'roles'>

export async function getRoles(): Promise<Result<Error, Role[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('label')

    if (error) {
      return err(new Error(`Failed to fetch roles: ${error.message}`))
    }

    return ok(data || [])
  } catch (error) {
    return err(
      new Error(
        `Error while fetching roles: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function updateRolePermissions(
  roleId: string,
  permissions: string[]
): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('roles')
      .update({ permissions })
      .eq('id', roleId)

    if (error) {
      return err(new Error(`Failed to update role permissions: ${error.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      new Error(
        `Error while updating role permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function deleteRole(roleId: string): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId)

    if (error) {
      return err(new Error(`Failed to delete role: ${error.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      new Error(
        `Error while deleting role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function createRole(
  label: string,
  permissions: string[] = []
): Promise<Result<Error, Role>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('roles')
      .insert({
        label,
        permissions,
      })
      .select()
      .single()

    if (error) {
      return err(new Error(`Failed to create role: ${error.message}`))
    }

    return ok(data)
  } catch (error) {
    return err(
      new Error(
        `Error while creating role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}