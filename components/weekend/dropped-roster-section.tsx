'use client'

import { Typography } from '@/components/ui/typography'
import { DroppedRosterTable } from '@/components/weekend/roster-view/dropped-roster-table'
import { WeekendRosterMember } from '@/services/weekend'
import { useRoster } from '@/hooks/use-roster'

type DroppedRosterSectionProps = {
  roster: Array<WeekendRosterMember>
  showWhenEmpty?: boolean
}

export function DroppedRosterSection({
  roster,
  showWhenEmpty = false,
}: DroppedRosterSectionProps) {
  const { counts, hasDropped } = useRoster(roster)

  // Don't render if no dropped members and showWhenEmpty is false
  if (!hasDropped && !showWhenEmpty) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="mb-4">
        <Typography variant="h2" className="text-xl mb-2 flex items-center">
          Dropped Team Members
          <span className="text-black/30 font-light text-base ms-2">
            ({counts.dropped} members)
          </span>
        </Typography>
      </div>

      <DroppedRosterTable roster={roster} />
    </div>
  )
}
