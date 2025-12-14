import { User } from '@/lib/users/types'
import { Errors } from './error'
import { CHARole } from './weekend/types'
import { isNil } from 'lodash'

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
  if (isNil(user.teamMemberInfo?.cha_role)) {
    return false
  }
  return chaRoles.map(toString).includes(user.teamMemberInfo.cha_role)
}

export enum Permission {
  // File management
  FILES_UPLOAD = 'FILES_UPLOAD',
  FILES_DELETE = 'FILES_DELETE',

  // User management
  READ_USERS = 'READ_USERS',
  READ_USER_EXPERIENCE = 'READ_USER_EXPERIENCE',

  // Candidate management
  READ_CANDIDATES = 'READ_CANDIDATES',
  WRITE_CANDIDATES = 'WRITE_CANDIDATES',
  DELETE_CANDIDATES = 'DELETE_CANDIDATES',

  // Weekend admin management
  READ_DROPPED_ROSTER = 'READ_DROPPED_ROSTER',
  WRITE_TEAM_ROSTER = 'WRITE_TEAM_ROSTER',
  READ_WEEKENDS = 'READ_WEEKENDS',
  WRITE_WEEKENDS = 'WRITE_WEEKENDS',

  READ_EVENTS = 'READ_EVENTS',
  WRITE_EVENTS = 'WRITE_EVENTS',

  // Payments
  READ_PAYMENTS = 'READ_PAYMENTS',
  WRITE_PAYMENTS = 'WRITE_PAYMENTS',

  // Security
  WRITE_USER_ROLES = 'WRITE_USER_ROLES',
  READ_USER_ROLES = 'READ_USER_ROLES',

  // General
  FULL_ACCESS = 'FULL_ACCESS',
  READ_ADMIN_PORTAL = 'READ_ADMIN_PORTAL',
}
