import { WeekendRosterMember } from '@/actions/weekend'

/**
 * Filters roster members by their status
 */
export function filterRosterByStatus(
  roster: Array<WeekendRosterMember>,
  status: string | null
): Array<WeekendRosterMember> {
  return roster.filter((member) => member.status === status)
}

/**
 * Gets active roster members (excludes dropped members)
 */
export function getActiveRoster(
  roster: Array<WeekendRosterMember>
): Array<WeekendRosterMember> {
  return roster.filter((member) => member.status !== 'drop')
}

/**
 * Gets dropped roster members
 */
export function getDroppedRoster(
  roster: Array<WeekendRosterMember>
): Array<WeekendRosterMember> {
  return filterRosterByStatus(roster, 'drop')
}

/**
 * Splits roster into active and dropped members
 */
export function splitRosterByStatus(roster: Array<WeekendRosterMember>) {
  return {
    activeRoster: getActiveRoster(roster),
    droppedRoster: getDroppedRoster(roster),
  }
}

/**
 * Gets roster counts by status
 */
export function getRosterCounts(roster: Array<WeekendRosterMember>) {
  const { activeRoster, droppedRoster } = splitRosterByStatus(roster)

  return {
    active: activeRoster.length,
    dropped: droppedRoster.length,
    total: roster.length,
  }
}
