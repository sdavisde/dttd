import { format } from 'date-fns'
import { groupBy, orderBy, uniq } from 'lodash'
import { CHARole } from '@/lib/weekend/types'
import type {
  ExperienceLevel,
  RectorReadyStatus,
  RectorReadyCriteria,
  GroupedExperience,
  UserExperienceRecord,
} from '@/services/master-roster/types'
import { UserExperience } from './validation'
import { WeekendReference } from '@/lib/weekend/weekend-reference'

const HEAD_AND_ASSISTANT_HEAD_ROLES: CHARole[] = [
  CHARole.HEAD,
  CHARole.ASSISTANT_HEAD,
]

const TEAM_HEAD_ROLES: CHARole[] = [
  CHARole.HEAD_TECH,
  CHARole.HEAD_ROLLISTA,
  CHARole.HEAD_SPIRITUAL_DIRECTOR,
  CHARole.HEAD_PRAYER,
  CHARole.HEAD_CHAPEL,
  CHARole.HEAD_CHAPEL_TECH,
  CHARole.HEAD_MUSIC,
  CHARole.HEAD_PALANCA,
  CHARole.HEAD_TABLE,
  CHARole.HEAD_DORM,
  CHARole.HEAD_DINING,
  CHARole.HEAD_MOBILE,
]

const DINING_ROLES: string[] = [CHARole.DINING, CHARole.HEAD_DINING]

export function calculateExperienceLevel(
  distinctWeekendCount: number
): ExperienceLevel {
  if (distinctWeekendCount <= 1) {
    return 1
  }
  if (distinctWeekendCount <= 3) {
    return 2
  }
  return 3
}

export function calculateRectorReadyStatus(
  records: UserExperience[]
): RectorReadyStatus {
  const criteria: RectorReadyCriteria = {
    hasServedHeadOrAssistantHead: records.some((r) =>
      HEAD_AND_ASSISTANT_HEAD_ROLES.includes(r.cha_role)
    ),
    hasServedTeamHead: records.some((r) =>
      TEAM_HEAD_ROLES.includes(r.cha_role)
    ),
    hasGivenTwoOrMoreTalks: records.filter((r) => r.rollo !== null).length >= 2,
    hasWorkedDining: records.some((r) => DINING_ROLES.includes(r.cha_role)),
  }

  const isReady =
    criteria.hasServedHeadOrAssistantHead &&
    criteria.hasServedTeamHead &&
    criteria.hasGivenTwoOrMoreTalks &&
    criteria.hasWorkedDining

  return { isReady, criteria }
}

export function formatExperienceDate(date: Date): string {
  return format(date, 'MMM yyyy')
}

export function groupExperienceByCommunity(
  records: UserExperience[]
): GroupedExperience[] {
  // Sort by date descending
  const sortedRecords = orderBy(records, ['created_at'], ['desc'])

  // Group by community name
  const grouped = groupBy(sortedRecords, (r) => {
    const { community } = WeekendReference.fromString(r.weekend_reference)
    return community
  })

  // Transform to output format
  const result = Object.entries(grouped).map(([community, entries]) => {
    return {
      community,
      records: entries,
    }
  })

  // Ensure DTTD comes first
  const dttd = result.find((g) => g.community === 'DTTD')
  const others = result.filter((g) => g.community !== 'DTTD')

  return dttd ? [dttd, ...others] : others
}

/**
 * Counts the number of weekends served by the user
 */
export function countDistinctWeekends(
  records: Pick<UserExperienceRecord, 'weekend_id' | 'weekend_reference'>[]
): number {
  const weekendIds = records
    .map((r) => r.weekend_id ?? r.weekend_reference)
    .filter((id): id is string => id !== null)

  return uniq(weekendIds).length
}
