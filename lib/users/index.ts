import { TeamMemberUser, User } from './types'

/**
 * Helper function to check if a user is on the active weekend roster.
 * This is determined by the presence of the team_member_info field on the User object.
 *
 * Note: The team_member_info field is populated in actions/users.ts and contains
 * information about the user's CHA role and status if they are on the upcoming
 * weekend team roster for a weekend that matches their gender and has ACTIVE status.
 *
 * @param user - The User object to check
 * @returns true if the user has team_member_info (is on active weekend roster), false otherwise
 */
export function isUserOnActiveTeam(user: User): user is TeamMemberUser {
  return user.team_member_info !== null
}
