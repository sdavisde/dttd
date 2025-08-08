import { User } from '@/lib/users/types'
import { Errors } from './error'
import { isErr, Result } from './results'
import { getLoggedInUser } from '@/actions/users'
import { cache } from 'react'

export enum UserPermissions {
  FULL_ACCESS = "FULL_ACCESS",
  ADMIN = "ADMIN",
  READ_CANDIDATES = "READ_CANDIDATES",
  WRITE_CANDIDATES = "WRITE_CANDIDATES",
  READ_MEETINGS = "READ_MEETINGS",
  WRITE_MEETINGS = "WRITE_MEETINGS"
}

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
  if (user.role?.permissions.includes(UserPermissions.FULL_ACCESS)) {
    return true
  }

  return permissions.some((permission) =>
    user.role?.permissions.includes(permission)
  )
}

export function validateUser(userResult: Result<Error, User>): User {
  const user = userResult.data
  if (isErr(userResult) || !user) {
    throw new Error(Errors.NOT_LOGGED_IN.toString())
  }

  return user
}

export const getValidatedUser = cache(async (): Promise<User> => {
  const userResult = await getLoggedInUser()
  return validateUser(userResult)
})

export async function getValidatedUserWithPermissions(permissions: string[]): Promise<User> {
  const user = await getValidatedUser()
  permissionLock(permissions)(user)
  return user
}
