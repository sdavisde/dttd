import { Badge } from '@/components/ui/badge'
import { CandidateStatus } from '@/lib/candidates/types'

interface StatusChipProps {
  status: CandidateStatus
}

export function StatusChip({ status }: StatusChipProps) {
  const statusConfig: Record<
    CandidateStatus,
    {
      color: 'info' | 'warning' | 'secondary' | 'success' | 'error'
      label: string
    }
  > = {
    sponsored: { color: 'info', label: 'Sponsored' },
    awaiting_forms: { color: 'warning', label: 'Awaiting Forms' },
    awaiting_payment: { color: 'warning', label: 'Awaiting Payment' },
    confirmed: { color: 'success', label: 'Confirmed' },
    rejected: { color: 'error', label: 'Rejected' },
  }

  const config = statusConfig[status] ?? {
    color: 'secondary' as const,
    label: 'Unknown',
  }
  return (
    <Badge color={config.color} className="text-xs">
      {config.label}
    </Badge>
  )
}
