import 'server-only'

import { isErr, ok, Result } from '@/lib/results'
import * as RoleRepository from './repository'
import { Tables } from '@/lib/supabase/database.types'
import { Permission } from '@/lib/security'
import { Role } from './types'

function normalizeRole(rawRole: Tables<'roles'>): Role {
  return {
    id: rawRole.id,
    label: rawRole.label,
    permissions: rawRole.permissions as Array<Permission>,
    type: (rawRole as any).type ?? 'INDIVIDUAL',
    description: (rawRole as any).description ?? null,
  }
}

export async function getRoles(): Promise<Result<string, Role[]>> {
  const result = await RoleRepository.getAllRoles()
  if (isErr(result)) {
    return result
  }
  const roles = result.data.map(normalizeRole)
  return ok(roles)
}

export async function updateRolePermissions(
  roleId: string,
  permissions: Permission[]
): Promise<Result<string, null>> {
  return await RoleRepository.updateRolePermissions(roleId, permissions)
}

export async function deleteRole(
  roleId: string
): Promise<Result<string, null>> {
  return await RoleRepository.deleteRole(roleId)
}

export async function createRole(
  label: string,
  permissions: Permission[] = []
): Promise<Result<string, Role>> {
  const roleResult = await RoleRepository.createRole(label, permissions)
  if (isErr(roleResult)) {
    return roleResult
  }
  return ok(normalizeRole(roleResult.data))
}

export async function updateUserRoles(
  userId: string,
  roleIds: string[]
): Promise<Result<string, Array<Tables<'user_roles'>>>> {
  const result = await RoleRepository.updateUserRoles(userId, roleIds)
  if (isErr(result)) {
    return result
  }
  return ok(result.data ?? [])
}

export async function removeAllUserRoles(
  userId: string
): Promise<Result<string, null>> {
  return await RoleRepository.removeAllUserRoles(userId)
}

/**
 * Sets the complete list of users assigned to a role.
 * For COMMITTEE roles, this replaces all current members with the new list.
 */
export async function setRoleMembers(
  roleId: string,
  userIds: string[]
): Promise<Result<string, Array<Tables<'user_roles'>>>> {
  const result = await RoleRepository.setRoleMembers(roleId, userIds)
  if (isErr(result)) {
    return result
  }
  return ok(result.data ?? [])
}
