'use client'

import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { capitalize, cn, toLocalDateFromISO } from '@/lib/utils'
import { Weekend } from '@/lib/weekend/types'
import { formatDateLabel } from '@/lib/weekend/scheduling'
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

  const startLabel = formatDateLabel(startDate, { year: undefined })
  const endLabel = formatDateLabel(endDate)

  return `${startLabel} - ${endLabel}`
}

export function WeekendCard({ weekend }: WeekendCardProps) {
  return (
    <Link href={`/admin/weekends/${weekend.id}`} className="group">
      <Alert
        className={cn(
          'transition-all duration-200 min-h-16 h-full flex flex-col justify-center gap-1',
          'group-hover:ring-2 group-hover:ring-primary/50 group-hover:shadow-sm',
          'bg-card/50'
        )}
      >
        <Typography variant="small" className="font-semibold">
          {capitalize(weekend.type.toLowerCase())} roster
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          {formatDateRange(weekend.start_date, weekend.end_date)}
        </Typography>
      </Alert>
    </Link>
  )
}
