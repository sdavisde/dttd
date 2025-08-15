import { Badge } from '@/components/ui/badge'

type RosterStatus = 'awaiting_payment' | 'paid' | 'drop'

interface RosterStatusChipProps {
  status: RosterStatus | null
}

export function RosterStatusChip({ status }: RosterStatusChipProps) {
  const statusConfig: Record<RosterStatus, { color: 'warning' | 'success' | 'error'; label: string }> = {
    awaiting_payment: { color: 'warning', label: 'Awaiting Payment' },
    paid: { color: 'success', label: 'Paid' },
    drop: { color: 'error', label: 'Drop' },
  }

  if (!status) {
    return (
      <Badge variant="outline">
        No Status
      </Badge>
    )
  }

  const config = statusConfig[status] ?? { color: 'error' as const, label: 'Unknown' }
  return (
    <Badge color={config.color}>
      {config.label}
    </Badge>
  )
}
