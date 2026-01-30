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
export type { WeekendRosterMember, WeekendSidebarPayload } from './types'

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
