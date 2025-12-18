'use server'

import * as RoleService from './role-service'
import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { Tables } from '@/database.types'
import { Role } from './types'

// Read operations - doesn't require authorizedAction since reading roles list is safe
export const getRoles = async () => {
  return await RoleService.getRoles()
}

type UpdateRolePermissionsRequest = {
  roleId: string
  permissions: Permission[]
}
export const updateRolePermissions = authorizedAction<UpdateRolePermissionsRequest, null>(
  Permission.WRITE_USER_ROLES,
  async ({ roleId, permissions }) => {
    return await RoleService.updateRolePermissions(roleId, permissions)
  }
)

export const deleteRole = authorizedAction<string, null>(
  Permission.WRITE_USER_ROLES,
  async (roleId) => {
    return await RoleService.deleteRole(roleId)
  }
)

type CreateRoleRequest = {
  label: string
  permissions?: Permission[]
}
export const createRole = authorizedAction<CreateRoleRequest, Role>(
  Permission.WRITE_USER_ROLES,
  async ({ label, permissions }) => {
    return await RoleService.createRole(label, permissions)
  }
)

type UpdateUserRolesRequest = {
  userId: string
  roleIds: string[]
}
export const updateUserRoles = authorizedAction<UpdateUserRolesRequest, Array<Tables<'user_roles'>>>(
  Permission.WRITE_USER_ROLES,
  async ({ userId, roleIds }) => {
    return await RoleService.updateUserRoles(userId, roleIds)
  }
)

export const removeAllUserRoles = authorizedAction<string, null>(
  Permission.WRITE_USER_ROLES,
  async (userId) => {
    return await RoleService.removeAllUserRoles(userId)
  }
)
