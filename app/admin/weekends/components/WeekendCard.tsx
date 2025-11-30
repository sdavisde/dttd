'use client'

import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { Weekend } from '@/lib/weekend/types'
import { formatDateLabel, toLocalDateFromISO } from '@/lib/weekend/scheduling'
import { formatWeekendTitle } from '@/lib/weekend'
import Link from 'next/link'

interface WeekendCardProps {
  weekend: Weekend
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  const startDate = toLocalDateFromISO(start)
  const endDate = toLocalDateFromISO(end)

  if (!startDate || !endDate) {
    return 'Dates TBD'
  }

  const startLabel = formatDateLabel(startDate)
  const endLabel = formatDateLabel(endDate)

  return `${startLabel} - ${endLabel}`
}

export function WeekendCard({ weekend }: WeekendCardProps) {
  return (
    <Link
      href={`/admin/weekends/${weekend.id}`}
      className={cn('relative group cursor-pointer block')}
    >
      <Alert
        className={cn(
          'transition-all duration-200 h-full flex flex-col gap-4',
          'group-hover:ring-2 group-hover:ring-primary/50 group-hover:shadow-md'
        )}
      >
        <div className="space-y-3 ml-7">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Typography variant="small" className="font-semibold">
                {formatWeekendTitle(weekend)}
              </Typography>
            </div>
            <Typography variant="small" className="text-muted-foreground">
              {formatDateRange(weekend.start_date, weekend.end_date)}
            </Typography>
          </div>
        </div>
      </Alert>
    </Link>
  )
}
