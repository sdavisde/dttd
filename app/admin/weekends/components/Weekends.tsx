'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendGroupGrid } from './WeekendGroupGrid'
import { WeekendSidebar } from './WeekendSidebar'
import { SetActiveWeekendButton } from './SetActiveWeekendButton'
import { toLocalDateFromISO } from '@/lib/utils'
import { isNil } from 'lodash'

interface WeekendsProps {
  weekendGroups: WeekendGroupWithId[]
  canEdit?: boolean
}

type WeekendGroupBuckets = {
  upcoming: WeekendGroupWithId[]
  past: WeekendGroupWithId[]
}

const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const splitWeekendGroups = (
  groups: WeekendGroupWithId[]
): WeekendGroupBuckets => {
  const today = startOfToday()
  return groups.reduce<WeekendGroupBuckets>(
    (acc, group) => {
      const mensStart = toLocalDateFromISO(group.weekends.MENS?.start_date)
      const womensEnd = toLocalDateFromISO(group.weekends.WOMENS?.end_date)

      const isPast = !isNil(womensEnd) && womensEnd < today
      const isUpcoming = !isNil(mensStart) && mensStart > today

      if (isPast) {
        acc.past.push(group)
        return acc
      }

      if (isUpcoming) {
        acc.upcoming.push(group)
        return acc
      }

      // Default to upcoming for groups that are current or missing dates
      acc.upcoming.push(group)
      return acc
    },
    { upcoming: [], past: [] }
  )
}

const sortByDateAscending = (groups: WeekendGroupWithId[]) =>
  [...groups].sort((a, b) => {
    const aDate =
      toLocalDateFromISO(a.weekends.MENS?.start_date) ??
      toLocalDateFromISO(a.weekends.WOMENS?.start_date)
    const bDate =
      toLocalDateFromISO(b.weekends.MENS?.start_date) ??
      toLocalDateFromISO(b.weekends.WOMENS?.start_date)

    if (!aDate && !bDate) {
      return 0
    }

    if (!aDate) {
      return 1
    }

    if (!bDate) {
      return -1
    }

    return aDate.getTime() - bDate.getTime()
  })

const sortByDateDescending = (groups: WeekendGroupWithId[]) =>
  [...groups].sort((a, b) => {
    const aDate =
      toLocalDateFromISO(a.weekends.WOMENS?.end_date) ??
      toLocalDateFromISO(a.weekends.MENS?.end_date)
    const bDate =
      toLocalDateFromISO(b.weekends.WOMENS?.end_date) ??
      toLocalDateFromISO(b.weekends.MENS?.end_date)

    if (!aDate && !bDate) {
      return 0
    }

    if (!aDate) {
      return 1
    }

    if (!bDate) {
      return -1
    }

    return bDate.getTime() - aDate.getTime()
  })

export function Weekends({ weekendGroups, canEdit = false }: WeekendsProps) {
  const [selectedGroup, setSelectedGroup] = useState<WeekendGroupWithId | null>(
    null
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { upcoming, past } = useMemo(
    () => splitWeekendGroups(weekendGroups),
    [weekendGroups]
  )

  const upcomingGroups = useMemo(
    () => sortByDateAscending(upcoming),
    [upcoming]
  )
  const pastGroups = useMemo(() => sortByDateDescending(past), [past])

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedGroup(null)
  }

  const handleGroupEdit = (group: WeekendGroupWithId) => {
    if (!canEdit) {
      return
    }
    setSelectedGroup(group)
    setIsSidebarOpen(true)
  }

  const handleAddWeekendGroup = () => {
    if (!canEdit) {
      return
    }
    setSelectedGroup(null)
    setIsSidebarOpen(true)
  }

  const sidebarState = isSidebarOpen ? 'open' : 'closed'
  const sidebarAnnouncement = selectedGroup
    ? `Editing weekend group ${selectedGroup.groupId}`
    : 'No weekend group selected'

  return (
    <div className="space-y-6" data-sidebar-state={sidebarState}>
      <span className="sr-only" aria-live="polite">
        {sidebarAnnouncement}
      </span>

      <div className="flex items-center justify-between mb-2">
        <Typography variant="h4" as="h1">
          Weekends
        </Typography>
        {canEdit && (
          <div className="flex items-center gap-2">
            <SetActiveWeekendButton weekendGroups={upcomingGroups} />
            <Button
              onClick={handleAddWeekendGroup}
              size="sm"
              className="flex items-center gap-2"
              aria-expanded={isSidebarOpen}
            >
              <Plus className="w-4 h-4" />
              Add Weekends
            </Button>
          </div>
        )}
      </div>

      <div className="w-full">
        <div className="w-full mt-4 mb-2">
          <Typography variant="h5">Upcoming Weekends</Typography>
        </div>
        <WeekendGroupGrid
          groups={upcomingGroups}
          canEdit={canEdit}
          handleGroupEdit={handleGroupEdit}
        />
      </div>

      <div className="w-full">
        <div className="w-full mt-8 mb-2">
          <Typography variant="h5">Past Weekends</Typography>
        </div>
        <WeekendGroupGrid
          groups={pastGroups}
          canEdit={canEdit}
          handleGroupEdit={handleGroupEdit}
          isPast
        />
      </div>

      <WeekendSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        weekendGroup={selectedGroup}
      />
    </div>
  )
}
