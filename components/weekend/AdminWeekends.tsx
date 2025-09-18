'use client'

import { Calendar } from 'lucide-react'
import { Weekend } from '@/lib/weekend/types'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { WeekendCard } from './WeekendCard'

type AdminWeekendsProps = {
  weekends?: Weekend[]
  canEdit: boolean
  onWeekendClick?: (weekend: Weekend) => void
  isPast?: boolean
}

export function AdminWeekends({
  weekends,
  canEdit,
  onWeekendClick,
  isPast = false,
}: AdminWeekendsProps) {
  if (!weekends || weekends.length === 0) {
    return (
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <Alert className="h-full flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
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
      {weekends.map((weekend) => (
        <WeekendCard
          key={weekend.id}
          weekend={weekend}
          canEdit={canEdit}
          onClick={onWeekendClick}
          isPast={isPast}
        />
      ))}
    </div>
  )
}
