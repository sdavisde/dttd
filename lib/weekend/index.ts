import { isNil } from 'lodash'
import type { WeekendGroupWithId, WeekendStatusValue } from './types'
import type { TeamMemberInfo, WeekendType } from './types'
import {
  formatWeekendGender,
  formatWeekendGroupTitle,
  getWeekendLabel,
} from './labels'
import { toWeekendRef } from './weekend-reference'

export {
  formatWeekendGender,
  formatWeekendGroupTitle,
  formatWeekendLabelFor,
  formatWeekendTitle,
  getWeekendLabel,
} from './labels'
export type { WeekendGenderStyle, WeekendLabelOptions } from './labels'
export type {
  AnyWeekendRef,
  CommunityWeekendRef,
  WeekendRef,
} from './weekend-reference'
export {
  formatCommunityWeekendRef,
  isWeekendRef,
  parseCommunityWeekendRef,
  toCommunityWeekendRef,
  toWeekendRef,
  weekendToRef,
} from './weekend-reference'

export const genderMatchesWeekend = (
  gender: string | null,
  weekendType: string | null
) => {
  if (isNil(gender) || isNil(weekendType)) return false
  return (
    (gender === 'male' && weekendType === 'MENS') ||
    (gender === 'female' && weekendType === 'WOMENS')
  )
}

// Get the status of a weekend group (both MENS and WOMENS should have same status)
export const getGroupStatus = (
  group: WeekendGroupWithId
): WeekendStatusValue | null => {
  return group.weekends.MENS?.status ?? group.weekends.WOMENS?.status ?? null
}

/**
 * Formats a display title for team forms based on the group's weekend assignments.
 * - Single assignment: e.g., "DTTD Mens #11"
 * - Multiple assignments: e.g., "DTTD #11" (covers both weekends)
 */
export function formatTeamMemberTitle(teamMemberInfo: TeamMemberInfo): string {
  const { groupNumber, weekendAssignments } = teamMemberInfo

  // A volunteer serving both weekends is covered by the group-level label.
  const gender =
    weekendAssignments.length === 1
      ? (weekendAssignments[0].weekendType as WeekendType | null)
      : null

  if (isNil(groupNumber) || isNil(gender)) {
    return formatWeekendGroupTitle(groupNumber)
  }

  return getWeekendLabel(toWeekendRef({ number: groupNumber, gender }))
}

/**
 * Formats a display role string for team forms.
 * - Single assignment: e.g., "Table Leader"
 * - Multiple assignments, same role: e.g., "Table Leader"
 * - Multiple assignments, different roles: e.g., "Table Leader (Mens) and Rector (Womens)"
 */
export function formatTeamMemberRole(teamMemberInfo: TeamMemberInfo): string {
  const { weekendAssignments } = teamMemberInfo

  if (weekendAssignments.length === 0) return 'Team Member'

  if (weekendAssignments.length === 1) {
    return weekendAssignments[0].chaRole ?? 'Team Member'
  }

  const uniqueRoles = [...new Set(weekendAssignments.map((a) => a.chaRole))]
  if (uniqueRoles.length === 1) {
    return uniqueRoles[0] ?? 'Team Member'
  }

  return weekendAssignments
    .map((a) => {
      const typeLabel = formatWeekendGender(a.weekendType as WeekendType | null)
      const suffix = !isNil(typeLabel) ? ` (${typeLabel})` : ''
      return `${a.chaRole ?? 'Team Member'}${suffix}`
    })
    .join(' and ')
}
