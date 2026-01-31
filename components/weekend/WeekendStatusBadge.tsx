import { CheckCircle, Clock, CircleCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WeekendStatus, WeekendStatusValue } from '@/lib/weekend/types'

interface WeekendStatusBadgeProps {
  status?: WeekendStatusValue | null
}

export function WeekendStatusBadge({ status }: WeekendStatusBadgeProps) {
  if (!status) {
    return null
  }

  switch (status) {
    case WeekendStatus.ACTIVE:
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>
      )
    case WeekendStatus.FINISHED:
      return (
        <Badge
          variant="outline"
          className="gap-1 text-muted-foreground bg-muted"
        >
          <CircleCheck className="w-3 h-3" />
          Finished
        </Badge>
      )
    case WeekendStatus.PLANNING:
      return (
        <Badge
          variant="outline"
          className="gap-1 bg-transparent border-primary text-primary"
        >
          <Clock className="w-3 h-3" />
          Planning
        </Badge>
      )
    default:
      return null
  }
}
