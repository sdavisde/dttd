'use server'

import * as MasterRosterService from './master-roster-service'

/**
 * @returns the master roster with all user information in the community.
 * Provides helpful information about each user to help with community management.
 */
export async function getMasterRoster() {
  return await MasterRosterService.getMasterRoster()
}
