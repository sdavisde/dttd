'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { User } from '@/lib/users/types'
import {
  WeekendStatusValue,
  WeekendGroupWithId,
  CreateWeekendGroupInput,
  UpdateWeekendGroupInput,
} from '@/lib/weekend/types'
import { WeekendSidebarPayload } from './types'
import * as WeekendService from './weekend-service'

// Re-export types for convenience
export type { WeekendRosterViewData } from './weekend-service'

// ============================================================================
// Public Actions (No Authorization)
// ============================================================================

/**
 * Fetches active weekends grouped by type.
 * Public - used by candidate forms and admin layout.
 */
export async function getActiveWeekends() {
  return WeekendService.getActiveWeekends()
}

/**
 * Fetches a weekend group by its group ID.
 * Internal use only.
 */
export async function getWeekendGroup(groupId: string) {
  return WeekendService.getWeekendGroup(groupId)
}

/**
 * Fetches a single weekend by ID.
 * Public - used by team form pages.
 */
export async function getWeekendById(weekendId: string) {
  return WeekendService.getWeekendById(weekendId)
}

/**
 * Fetches the roster for a weekend.
 * Public - everyone should be able to read team rosters.
 */
export async function getWeekendRoster(weekendId: string) {
  return WeekendService.getWeekendRoster(weekendId)
}

/**
 * Fetches all users.
 * Public - no auth required.
 */
export async function getAllUsers() {
  return WeekendService.getAllUsers()
}

/**
 * Fetches a weekend roster record for payment flow.
 * Public - payment flow uses admin client bypass.
 */
export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
) {
  return WeekendService.getWeekendRosterRecord(teamUserId, weekendId)
}

/**
 * Records a manual (cash/check) payment.
 * Public - no auth per user request.
 */
export async function recordManualPayment(
  weekendRosterId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  notes?: string
) {
  return WeekendService.recordManualPayment(
    weekendRosterId,
    paymentAmount,
    paymentMethod,
    notes
  )
}

/**
 * Fetches weekend options for dropdowns.
 * Public - no auth per user request.
 */
export async function getWeekendOptions() {
  return WeekendService.getWeekendOptions()
}

// ============================================================================
// Protected Actions (Authorization Required)
// ============================================================================

type GetWeekendGroupsByStatusRequest = {
  statuses?: WeekendStatusValue[]
}

/**
 * Fetches all weekend groups, optionally filtered by statuses.
 * Requires READ_WEEKENDS permission.
 */
export const getWeekendGroupsByStatus = authorizedAction<
  GetWeekendGroupsByStatusRequest,
  WeekendGroupWithId[]
>(Permission.READ_WEEKENDS, async ({ statuses }) => {
  return WeekendService.getWeekendGroupsByStatus(statuses)
})

type SetActiveWeekendGroupRequest = {
  groupId: string
}

/**
 * Sets a weekend group as active.
 * Requires WRITE_WEEKENDS permission.
 */
export const setActiveWeekendGroup = authorizedAction<
  SetActiveWeekendGroupRequest,
  WeekendGroupWithId
>(Permission.WRITE_WEEKENDS, async ({ groupId }) => {
  return WeekendService.setActiveWeekendGroup(groupId)
})

/**
 * Creates a new weekend group.
 * Requires WRITE_WEEKENDS permission.
 */
export const createWeekendGroup = authorizedAction<
  CreateWeekendGroupInput,
  WeekendGroupWithId
>(Permission.WRITE_WEEKENDS, async (input) => {
  return WeekendService.createWeekendGroup(input)
})

type UpdateWeekendGroupRequest = {
  groupId: string
  updates: UpdateWeekendGroupInput
}

/**
 * Updates an existing weekend group.
 * Requires WRITE_WEEKENDS permission.
 */
export const updateWeekendGroup = authorizedAction<
  UpdateWeekendGroupRequest,
  WeekendGroupWithId
>(Permission.WRITE_WEEKENDS, async ({ groupId, updates }) => {
  return WeekendService.updateWeekendGroup(groupId, updates)
})

type DeleteWeekendGroupRequest = {
  groupId: string
}

/**
 * Deletes a weekend group.
 * Requires WRITE_WEEKENDS permission.
 */
export const deleteWeekendGroup = authorizedAction<
  DeleteWeekendGroupRequest,
  { success: boolean }
>(Permission.WRITE_WEEKENDS, async ({ groupId }) => {
  return WeekendService.deleteWeekendGroup(groupId)
})

/**
 * Saves a weekend group from the sidebar UI.
 * Requires WRITE_WEEKENDS permission.
 */
export const saveWeekendGroupFromSidebar = authorizedAction<
  WeekendSidebarPayload,
  WeekendGroupWithId
>(Permission.WRITE_WEEKENDS, async (payload) => {
  return WeekendService.saveWeekendGroupFromSidebar(payload)
})

type AddUserToWeekendRosterRequest = {
  weekendId: string
  userId: string
  role: string
  rollo?: string
}

/**
 * Adds a user to a weekend roster.
 * Requires WRITE_TEAM_ROSTER permission.
 */
export const addUserToWeekendRoster = authorizedAction<
  AddUserToWeekendRosterRequest,
  void
>(Permission.WRITE_TEAM_ROSTER, async ({ weekendId, userId, role, rollo }) => {
  return WeekendService.addUserToWeekendRoster(weekendId, userId, role, rollo)
})

/**
 * Fetches all data required for the WeekendRosterView component.
 * Public - performs permission-based conditional fetching internally.
 */
export async function getWeekendRosterViewData(weekendId: string, user: User) {
  return WeekendService.getWeekendRosterViewData(weekendId, user)
}
