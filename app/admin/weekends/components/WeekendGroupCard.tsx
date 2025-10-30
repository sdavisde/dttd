'use client'

import { useState } from 'react'
import { CalendarRange, Edit } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Weekend,
  WeekendGroupWithId,
  WeekendType,
} from '@/lib/weekend/types'

interface WeekendGroupCardProps {
  group: WeekendGroupWithId
  canEdit?: boolean
  onClick?: (group: WeekendGroupWithId) => void
  isPast?: boolean
}

type WeekendSummary = {
  label: string
  weekend: Weekend | null
  type: WeekendType
}

const formatWeekendTitle = (weekend: Weekend | null, label: string) => {
  if (!weekend) {
    return `${label} TBD`
  }

  if (weekend.title) {
    return weekend.title
  }

  const numberSuffix = weekend.number ? ` #${weekend.number}` : ''
  return `${label}${numberSuffix}`
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) {
    return 'Dates TBD'
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Dates TBD'
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  const startLabel = startDate.toLocaleDateString('en-US', options)
  const endLabel = endDate.toLocaleDateString('en-US', options)

  return `${startLabel} - ${endLabel}`
}

export function WeekendGroupCard({
  group,
  canEdit = false,
  onClick,
  isPast = false,
}: WeekendGroupCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const weekendSummaries: WeekendSummary[] = [
    { label: 'Mens Weekend', weekend: group.weekends.MENS, type: 'MENS' },
    { label: 'Womens Weekend', weekend: group.weekends.WOMENS, type: 'WOMENS' },
  ]

  const handleClick = () => {
    if (canEdit && onClick) {
      onClick(group)
    }
  }

  const sharedNumber =
    group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? null

  return (
    <div
      className={cn(
        'relative',
        canEdit && 'cursor-pointer',
        isPast && 'opacity-60'
      )}
      onMouseEnter={() => canEdit && setIsHovered(true)}
      onMouseLeave={() => canEdit && setIsHovered(false)}
      onClick={handleClick}
    >
      <Alert
        className={cn(
          'transition-all duration-200 h-full flex flex-col gap-4',
          canEdit && isHovered && 'ring-2 ring-primary/50 shadow-md'
        )}
      >
        <div className="space-y-3 ml-7">
          {weekendSummaries.map(({ label, weekend, type }) => (
            <div key={type} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Typography variant="small" className="font-semibold">
                  {formatWeekendTitle(weekend, label)}
                </Typography>
              </div>
              <Typography variant="small" className="text-muted-foreground">
                {formatDateRange(weekend?.start_date, weekend?.end_date)}
              </Typography>
            </div>
          ))}
        </div>

        {canEdit && isHovered && (
          <div className="absolute top-2 right-2 p-1 bg-background/80 rounded-md shadow-sm">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </Alert>
    </div>
  )
}
