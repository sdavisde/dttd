'use client'

import { CalendarDays } from 'lucide-react'
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { WeekendGroupCard } from './WeekendGroupCard'

interface WeekendGroupGridProps {
  groups: WeekendGroupWithId[]
  canEdit: boolean
  handleGroupEdit?: (group: WeekendGroupWithId) => void
  isPast?: boolean
}

export function WeekendGroupGrid({
  groups,
  canEdit,
  handleGroupEdit,
  isPast = false,
}: WeekendGroupGridProps) {
  if (!groups || groups.length === 0) {
    return (
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <Alert className="h-full flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <CalendarDays className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <Typography variant="h6" className="font-semibold">
              No Weekends
            </Typography>
          </div>
          <div className="ml-7">
            <Typography variant="small" className="text-muted-foreground">
              There are no weekends to display.
            </Typography>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {groups.map((group) => (
        <WeekendGroupCard
          key={group.groupId}
          group={group}
          canEdit={canEdit && !isPast}
          onEdit={handleGroupEdit}
        />
      ))}
    </div>
  )
}
