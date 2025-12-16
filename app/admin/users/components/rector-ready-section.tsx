import { Check, X, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { RectorReadyStatus } from '@/lib/users/experience'

type RectorReadySectionProps = {
  status: RectorReadyStatus
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
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Rector Ready Status</h3>
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status.isReady
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}
        >
          {status.isReady ? 'Qualified' : 'In Progress'}
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
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {item.met ? (
                <Check className="w-3 h-3" />
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
