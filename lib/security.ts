import { User } from '@/lib/users/types'
import { Errors } from './error'

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

function userHasPermission(user: User, permissions: string[]): boolean {
  if (user.role?.permissions.includes('FULL_ACCESS')) {
    return true
  }

  return permissions.some((permission) =>
    user.role?.permissions.includes(permission)
  )
}
