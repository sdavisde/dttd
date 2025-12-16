import { Check, X, Minus, Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import type {
  RectorReadyStatus,
  RectorReadyStatusLabel,
} from '@/services/master-roster/types'

type RectorReadySectionProps = {
  status: RectorReadyStatus
}

function getStatusBadgeStyles(statusLabel: RectorReadyStatusLabel): string {
  switch (statusLabel) {
    case 'Has Served':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'Qualified':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'In Progress':
    default:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}

export function RectorReadySection({ status }: RectorReadySectionProps) {
  const criteriaList = [
    {
      label: 'Served as Head or Assistant Head',
      met: status.criteria.hasServedHeadOrAssistantHead,
    },
    {
      label: 'Served as a Team Head',
      met: status.criteria.hasServedTeamHead,
    },
    {
      label: 'Given 2+ Rollos',
      met: status.criteria.hasGivenTwoOrMoreTalks,
    },
    {
      label: 'Worked Dining Room',
      met: status.criteria.hasWorkedDining,
    },
    {
      label: 'Served as Rector on a DTTD Weekend',
      met: status.criteria.hasServedAsRector,
      isHighlight: true,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Rector Ready Status</h3>
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            getStatusBadgeStyles(status.statusLabel)
          )}
        >
          {status.statusLabel}
        </div>
      </div>

      <div className="space-y-2">
        {criteriaList.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                'mt-0.5 flex items-center justify-center w-5 h-5 rounded-full text-xs shrink-0',
                item.met
                  ? item.isHighlight
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {item.met ? (
                item.isHighlight ? (
                  <Star className="w-3 h-3 fill-current" />
                ) : (
                  <Check className="w-3 h-3" />
                )
              ) : (
                <Minus className="w-3 h-3" />
              )}
            </div>
            <span
              className={cn(
                'text-sm',
                item.met ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
