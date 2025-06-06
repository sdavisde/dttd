import { User } from '@/lib/supabase/types'

/**
 * Builds a callback to check user permissions. Will throw an error if the user does not have the required permissions.
 * @param permissions - The permissions required to access the resource
 * @returns A callback that checks if the user has one of the required persmissions
 */
export function permissionLock(permissions: string[]) {
  return (user: User | null) => {
    if (!user) {
      throw new Error('Attempting to check permissions without a user')
    }

    if (user.permissions.includes('FULL_ACCESS')) {
      return
    }

    const hasPermissions = permissions.some((permission) => user.permissions.includes(permission))
    if (!hasPermissions) {
      throw new Error(`User ${user.email} does not have the required permissions: ${permissions.join(', ')}`)
    }
  }
}
