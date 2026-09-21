'use client'

import { Typography } from '@/components/ui/typography'
import type { WeekendRosterMember } from '@/services/weekend'
import { useRoster } from '@/hooks/use-roster'

type ActiveRosterHeaderProps = {
  roster: Array<WeekendRosterMember>
  title?: string
  children?: React.ReactNode
}

export function ActiveRosterHeader({
  roster,
  title = 'Team Members',
  children,
}: ActiveRosterHeaderProps) {
  const { counts } = useRoster(roster)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
      <div>
        {/* h4 sizing keeps this section heading below the page title. */}
        <Typography variant="h4" as="h2" className="mb-2 flex items-center">
          {title}
          <span className="text-muted-foreground font-light text-base ms-2">
            ({counts.active} members)
          </span>
        </Typography>
      </div>
      {children}
    </div>
  )
}
