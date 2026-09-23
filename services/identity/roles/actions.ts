'use server'

import * as RoleService from './role-service'
import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import type { Tables } from '@/database.types'
import type { Role, RoleInput, RoleUsageById } from './types'
import type { FullAccessImpact } from './inheritance'

// Read operations - doesn't require authorizedAction since reading roles list is safe
export const getRoles = async () => {
  return await RoleService.getRoles()
}

export const getRoleUsage = authorizedAction<void, RoleUsageById>(
  Permission.READ_USER_ROLES,
  async () => await RoleService.getRoleUsage()
)

export const getFullAccessImpact = authorizedAction<void, FullAccessImpact>(
  Permission.READ_USER_ROLES,
  async () => await RoleService.getFullAccessImpact()
)

export const getRoleEffectivePermissions = authorizedAction<
  string,
  Permission[]
>(
  Permission.READ_USER_ROLES,
  async (roleId) => await RoleService.getRoleEffectivePermissions(roleId)
)

type UpdateRoleRequest = {
  roleId: string
  input: RoleInput
}
export const updateRole = authorizedAction<UpdateRoleRequest, Role>(
  Permission.WRITE_USER_ROLES,
  async ({ roleId, input }) => {
    return await RoleService.updateRole(roleId, input)
  }
)

export const deleteRole = authorizedAction<string, null>(
  Permission.WRITE_USER_ROLES,
  async (roleId) => {
    return await RoleService.deleteRole(roleId)
  }
)

export const createRole = authorizedAction<RoleInput, Role>(
  Permission.WRITE_USER_ROLES,
  async (input) => {
    return await RoleService.createRole(input)
  }
)

type DuplicateRoleRequest = {
  sourceRoleId: string
  label?: string
}
export const duplicateRole = authorizedAction<DuplicateRoleRequest, Role>(
  Permission.WRITE_USER_ROLES,
  async ({ sourceRoleId, label }) => {
    return await RoleService.duplicateRole(sourceRoleId, label)
  }
)

type UpdateUserRolesRequest = {
  userId: string
  roleIds: string[]
}
export const updateUserRoles = authorizedAction<
  UpdateUserRolesRequest,
  Array<Tables<'user_roles'>>
>(Permission.WRITE_USER_ROLES, async ({ userId, roleIds }) => {
  return await RoleService.updateUserRoles(userId, roleIds)
})

export const removeAllUserRoles = authorizedAction<string, null>(
  Permission.WRITE_USER_ROLES,
  async (userId) => {
    return await RoleService.removeAllUserRoles(userId)
  }
)

type SetRoleMembersRequest = {
  roleId: string
  userIds: string[]
}
/**
 * Sets the complete list of users assigned to a role.
 * For COMMITTEE roles, this replaces all current members with the new list.
 */
export const setRoleMembers = authorizedAction<
  SetRoleMembersRequest,
  Array<Tables<'user_roles'>>
>(Permission.WRITE_USER_ROLES, async ({ roleId, userIds }) => {
  return await RoleService.setRoleMembers(roleId, userIds)
})
