import { useMemo } from 'react'
import { WeekendRosterMember } from '@/services/weekend'
import {
  getActiveRoster,
  getDroppedRoster,
  splitRosterByStatus,
  getRosterCounts,
} from '@/lib/weekend/roster-utils'

export function useRoster(roster: Array<WeekendRosterMember>) {
  const rosterData = useMemo(() => {
    const { activeRoster, droppedRoster } = splitRosterByStatus(roster)
    const counts = getRosterCounts(roster)

    return {
      all: roster,
      active: activeRoster,
      dropped: droppedRoster,
      counts,
      hasDropped: droppedRoster.length > 0,
      hasActive: activeRoster.length > 0,
    }
  }, [roster])

  return rosterData
}
