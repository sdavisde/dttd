'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendCard } from './WeekendCard'
import { WeekendStatusBadge } from '@/components/weekend/WeekendStatusBadge'
import { getGroupStatus } from '@/lib/weekend'
import { isNil } from 'lodash'

interface WeekendGroupContainerProps {
  group: WeekendGroupWithId
  canEdit?: boolean
  onEdit?: (group: WeekendGroupWithId) => void
}

export function WeekendGroupContainer({
  group,
  canEdit,
  onEdit,
}: WeekendGroupContainerProps) {
  const { MENS, WOMENS } = group.weekends
  const groupTitle = group.weekends.MENS?.title?.replace(/mens|womens/gi, '')
  const groupStatus = getGroupStatus(group)

  return (
    <Alert className="relative flex flex-col justify-start items-center gap-4">
      {/* Status badge in top-right corner */}
      <div className="absolute top-3 right-3">
        <WeekendStatusBadge status={groupStatus} />
      </div>

      {/* Centered header with title and edit button */}
      <div className="flex items-center justify-center gap-2">
        <Typography variant="h5" className="font-semibold text-center">
          {groupTitle}
        </Typography>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(group)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Individual weekend cards */}
      <div className="grid grid-cols-2 gap-2">
        {!isNil(MENS) && <WeekendCard weekend={MENS} />}
        {!isNil(WOMENS) && <WeekendCard weekend={WOMENS} />}
      </div>
    </Alert>
  )
}
