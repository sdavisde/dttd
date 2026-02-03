/**
 * Weekend Service
 *
 * Public API for weekend management operations.
 * All server actions and types are exported from this file.
 */

// Actions
export {
  // Public actions (no auth)
  getActiveWeekends,
  getWeekendGroup,
  getWeekendById,
  getWeekendRoster,
  getAllUsers,
  getWeekendRosterRecord,
  recordManualPayment,
  getWeekendOptions,
  getWeekendRosterViewData,
  getActiveWeekendLeadershipTeam,
  // Protected actions (auth required)
  getWeekendGroupsByStatus,
  setActiveWeekendGroup,
  createWeekendGroup,
  updateWeekendGroup,
  deleteWeekendGroup,
  saveWeekendGroupFromSidebar,
  addUserToWeekendRoster,
} from './actions'

// Service types
export type {
  WeekendRosterMember,
  WeekendSidebarPayload,
  LeadershipTeamMember,
  LeadershipTeamData,
} from './types'
export type { WeekendRosterViewData } from './actions'

// Re-export commonly used types from lib/weekend/types
export { WeekendType, WeekendStatus } from '@/lib/weekend/types'

export type {
  Weekend,
  WeekendGroup,
  WeekendGroupWithId,
  WeekendStatusValue,
  WeekendWriteInput,
  WeekendUpdateInput,
  CreateWeekendGroupInput,
  UpdateWeekendGroupInput,
} from '@/lib/weekend/types'
