import { capitalize } from '@/lib/utils'
import type { Weekend, WeekendGroupWithId, WeekendStatusValue } from './types'
import type { TeamMemberInfo } from './types'

export const genderMatchesWeekend = (
  gender: string | null,
  weekendType: string | null
) => {
  if (!gender || !weekendType) return false
  return (
    (gender === 'male' && weekendType === 'MENS') ||
    (gender === 'female' && weekendType === 'WOMENS')
  )
}

export const trimWeekendTypeFromTitle = (title: string) => {
  return title.replace(/mens|Mens|Womens|womens/g, '')
}

export const formatWeekendTitle = (weekend: Weekend) => {
  const weekendTypeLabel = capitalize(weekend.type.toLowerCase())
  if (weekend.title) {
    // Remove mens or womens if it's in the weekend title already so that we can add it at the beginning consistently.
    const reducedTitle = trimWeekendTypeFromTitle(weekend.title)
    return `${weekendTypeLabel} ${reducedTitle}`
  }

  const numberSuffix = weekend.number ? ` #${weekend.number}` : ''
  return `${weekendTypeLabel}${numberSuffix}`
}

// Get the status of a weekend group (both MENS and WOMENS should have same status)
export const getGroupStatus = (
  group: WeekendGroupWithId
): WeekendStatusValue | null => {
  return group.weekends.MENS?.status ?? group.weekends.WOMENS?.status ?? null
}

/**
 * Formats a display title for team forms based on the group's weekend assignments.
 * - Single assignment: e.g., "Mens DTTD #11"
 * - Multiple assignments: e.g., "DTTD #11" (covers both weekends)
 */
export function formatTeamMemberTitle(teamMemberInfo: TeamMemberInfo): string {
  const { groupNumber, weekendAssignments } = teamMemberInfo
  const numberStr = groupNumber ? ` #${groupNumber}` : ''

  if (weekendAssignments.length === 1) {
    const type = weekendAssignments[0].weekendType
    const typeLabel = type ? capitalize(type.toLowerCase()) : null
    return typeLabel ? `${typeLabel} DTTD${numberStr}` : `DTTD${numberStr}`
  }

  return `DTTD${numberStr}`
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
      const typeLabel = a.weekendType
        ? capitalize(a.weekendType.toLowerCase())
        : null
      const suffix = typeLabel ? ` (${typeLabel})` : ''
      return `${a.chaRole ?? 'Team Member'}${suffix}`
    })
    .join(' and ')
}
