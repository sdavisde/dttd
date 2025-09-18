'use client'

import { useState } from 'react'
import { Calendar, Edit } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Weekend } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

type WeekendCardProps = {
  weekend: Weekend
  canEdit?: boolean
  onClick?: (weekend: Weekend) => void
  isPast?: boolean
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })

export function WeekendCard({
  weekend,
  canEdit = false,
  onClick,
  isPast = false,
}: WeekendCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (canEdit && onClick) {
      onClick(weekend)
    }
  }

  const weekendTitle =
    weekend.title || `${weekend.type} Weekend #${weekend.number ?? 'TBD'}`

  return (
    <div
      className={cn(
        'relative h-full',
        canEdit && 'cursor-pointer',
        isPast && 'opacity-60'
      )}
      onMouseEnter={() => canEdit && setIsHovered(true)}
      onMouseLeave={() => canEdit && setIsHovered(false)}
      onClick={handleClick}
    >
      <Alert
        className={cn(
          'transition-all duration-200 h-full flex flex-col gap-3',
          canEdit && isHovered && 'ring-2 ring-primary/50 shadow-md'
        )}
      >
        <div className="flex items-start gap-2">
          <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <Typography variant="h6" className="font-semibold">
              {weekendTitle}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(weekend.start_date)}</span>
              <span className="text-xs tracking-wide">to</span>
              <span>{formatDate(weekend.end_date)}</span>
            </div>
          </div>
        </div>

        {/* <div className="ml-7 flex flex-wrap gap-2">
          <Badge
            variant={weekend.type === 'MENS' ? 'default' : 'secondary'}
          >
            {weekend.type}
          </Badge>
          {weekend.number !== null && weekend.number !== undefined && (
            <Badge variant="outline">Weekend #{weekend.number}</Badge>
          )}
          <Badge
            variant={
              weekend.status === 'ACTIVE'
                ? 'default'
                : weekend.status === 'PLANNING'
                  ? 'outline'
                  : 'secondary'
            }
          >
            {weekend.status || 'UNKNOWN'}
          </Badge>
        </div> */}

        {canEdit && isHovered && (
          <div className="absolute top-2 right-2 p-1 bg-background/80 rounded-md shadow-sm">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </Alert>
    </div>
  )
}
