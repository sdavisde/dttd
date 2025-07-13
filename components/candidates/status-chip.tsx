import { Badge } from '@/components/ui/badge'
import { CandidateStatus } from '@/lib/candidates/types'

interface StatusChipProps {
  status: CandidateStatus
}

export function StatusChip({ status }: StatusChipProps) {
  const statusConfig: Record<CandidateStatus, { color: string; label: string }> = {
    sponsored: { color: 'default', label: 'Sponsored' },
    awaiting_forms: { color: 'warning', label: 'Awaiting Forms' },
    pending_approval: { color: 'info', label: 'Pending Approval' },
    awaiting_payment: { color: 'secondary', label: 'Awaiting Payment' },
    confirmed: { color: 'success', label: 'Confirmed' },
    rejected: { color: 'error', label: 'Rejected' },
  }

  const config = statusConfig[status] ?? { color: 'default', label: 'Unknown' }
  return (
    <Badge
      variant={config.color as 'default' | 'secondary' | 'destructive' | 'outline'}
      className='text-xs'
    >
      {config.label}
    </Badge>
  )
}
