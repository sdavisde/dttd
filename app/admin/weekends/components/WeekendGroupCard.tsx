'use client'

import { Edit } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import { Weekend, WeekendGroupWithId, WeekendType } from '@/lib/weekend/types'
import { formatDateLabel, toLocalDateFromISO } from '@/lib/weekend/scheduling'
import { formatWeekendTitle } from '@/lib/weekend'
import { isNil } from 'lodash'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface WeekendGroupCardProps {
  group: WeekendGroupWithId
  canEdit?: boolean
  onEdit?: (group: WeekendGroupWithId) => void
}

type WeekendSummary = {
  label: string
  weekend: Weekend | null
  type: WeekendType
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

export function WeekendGroupCard({
  group,
  canEdit,
  onEdit,
}: WeekendGroupCardProps) {
  const weekendSummaries: WeekendSummary[] = [
    { label: 'Mens Weekend', weekend: group.weekends.MENS, type: 'MENS' },
    { label: 'Womens Weekend', weekend: group.weekends.WOMENS, type: 'WOMENS' },
  ]

  return (
    <Link
      // href={`/admin/weekends/${group.id}`}
      className={cn('relative group cursor-pointer')}
    >
      <Alert
        className={cn(
          'transition-all duration-200 h-full flex flex-col gap-4',
          'group-hover:ring-2 group-hover:ring-primary/50 group-hover:shadow-md'
        )}
      >
        <div className="space-y-3 ml-7">
          {weekendSummaries
            .filter((it) => !isNil(it.weekend))
            .map(({ weekend, type }) => (
              <div key={type} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Typography variant="small" className="font-semibold">
                    {/* Safe assertion because of filter above */}
                    {formatWeekendTitle(weekend!)}
                  </Typography>
                </div>
                <Typography variant="small" className="text-muted-foreground">
                  {formatDateRange(weekend?.start_date, weekend?.end_date)}
                </Typography>
              </div>
            ))}
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 flex md:hidden group-hover:flex"
            onClick={() => onEdit?.(group)}
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </Alert>
    </Link>
  )
}
