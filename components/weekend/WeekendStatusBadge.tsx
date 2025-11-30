import { CheckCircle, Clock, CircleCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WeekendStatus } from '@/lib/weekend/types'

interface WeekendStatusBadgeProps {
  status?: WeekendStatus | null
}

export function WeekendStatusBadge({ status }: WeekendStatusBadgeProps) {
  if (!status) {
    return null
  }

  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>
      )
    case 'FINISHED':
      return (
        <Badge variant="secondary" className="gap-1">
          <CircleCheck className="w-3 h-3" />
          Finished
        </Badge>
      )
    case 'PLANNING':
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          Planning
        </Badge>
      )
    default:
      return null
  }
}
