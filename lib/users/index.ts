import { TeamMemberUser, User } from './types'

/**
 * Helper function to check if a user is on the active weekend roster.
 * This is determined by the presence of the teamMemberInfo field on the User object.
 *
 * Note: The teamMemberInfo field is populated in the user service and contains
 * information about the user's CHA role and status if they are on the upcoming
 * weekend team roster for a weekend that has ACTIVE status.
 *
 * @param user - The User object to check
 * @returns true if the user has teamMemberInfo (is on active weekend roster), false otherwise
 */
export function isUserOnActiveTeam(user: User): user is TeamMemberUser {
  return user.teamMemberInfo !== null
}
