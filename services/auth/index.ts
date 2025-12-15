'use server'

import * as AuthService from './auth-service'

// Index.ts file contains the actions to be exposed to the client - i.e. the "Controller"

/**
 * @returns The logged in user's profile information
 */
export async function getLoggedInUser() {
  return await AuthService.getLoggedInUser()
}

/**
 * Updates the roles of a user to match those provided
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  return await AuthService.updateUserRoles(userId, roleIds)
}
