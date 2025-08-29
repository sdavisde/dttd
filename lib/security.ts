import { User } from '@/lib/users/types'
import { Errors } from './error'
import { CHARole } from './weekend/types'

/**
 * Builds a callback to check user permissions. Will throw an error if the user does not have the required permissions.
 * @param permissions - The permissions required to access the resource
 * @returns A callback that checks if the user has one of the required persmissions
 */
export function permissionLock(permissions: string[]) {
  return (user: User | null): true => {
    if (!user) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }

    if (!userHasPermission(user, permissions)) {
      throw new Error(Errors.INSUFFICIENT_PERMISSIONS.toString())
    }

    return true
  }
}

export function userHasPermission(user: User, permissions: string[]): boolean {
  if (user.role?.permissions.includes('FULL_ACCESS')) {
    return true
  }

  return permissions.some((permission) =>
    user.role?.permissions.includes(permission)
  )
}

export function userHasCHARole(user: User, chaRoles: Array<CHARole>): boolean {
  if (!user.team_member_info?.cha_role) {
    return false
  }
  return chaRoles.map(toString).includes(user.team_member_info.cha_role)
}

export enum Permission {
  FULL_ACCESS = 'FULL_ACCESS',
  FILES_UPLOAD = 'FILES_UPLOAD',
  FILES_DELETE = 'FILES_DELETE',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  READ_CANDIDATES = 'READ_CANDIDATES',
  WRITE_CANDIDATES = 'WRITE_CANDIDATES',
  DELETE_CANDIDATES = 'DELETE_CANDIDATES',
  READ_TEAM_PAYMENTS = 'READ_TEAM_PAYMENTS',
  WRITE_TEAM_ROSTER = 'WRITE_TEAM_ROSTER',
  ROLES_MANAGEMENT = 'ROLES_MANAGEMENT',
  READ_MEETINGS = 'READ_MEETINGS',
  WRITE_MEETINGS = 'WRITE_MEETINGS',
  READ_ADMIN_PORTAL = 'READ_ADMIN_PORTAL',
}
