'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendCard } from './WeekendCard'
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

  return (
    <div className="relative space-y-3">
      {/* Edit button positioned at top-right of the group */}
      {canEdit && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            variant="outline"
            size="icon"
            className="opacity-0 md:opacity-100 md:hover:opacity-100 transition-opacity"
            onClick={() => onEdit?.(group)}
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Individual weekend cards */}
      <div className="space-y-3">
        {!isNil(MENS) && <WeekendCard weekend={MENS} />}
        {!isNil(WOMENS) && <WeekendCard weekend={WOMENS} />}
      </div>
    </div>
  )
}
