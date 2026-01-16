'use client'

import { Typography } from '@/components/ui/typography'
import { WeekendRosterMember } from '@/services/weekend'
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
        <Typography variant="h2" className="text-xl mb-2 flex items-center">
          {title}
          <span className="text-black/30 font-light text-base ms-2">
            ({counts.active} members)
          </span>
        </Typography>
      </div>
      {children}
    </div>
  )
}
