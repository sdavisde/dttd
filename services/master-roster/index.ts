'use server'

import * as MasterRosterService from './master-roster-service'

/**
 * @returns the master roster with all user information in the community.
 * Provides helpful information about each user to help with community management.
 */
export async function getMasterRoster() {
  return await MasterRosterService.getMasterRoster()
}

/**
 * @returns the experience level distribution for active members of a weekend roster.
 * Calculates how many team members are at each experience level (1, 2, or 3).
 */
export async function getWeekendRosterExperienceDistribution(
  weekendId: string
) {
  return await MasterRosterService.getWeekendRosterExperienceDistribution(
    weekendId
  )
}
