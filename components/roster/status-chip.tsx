import { Badge } from '@/components/ui/badge'

type RosterStatus = 'awaiting_payment' | 'paid' | 'confirmed' | 'cancelled'

interface RosterStatusChipProps {
  status: RosterStatus | null
}

export function RosterStatusChip({ status }: RosterStatusChipProps) {
  const statusConfig: Record<RosterStatus, { color: 'warning' | 'success' | 'info' | 'error'; label: string }> = {
    awaiting_payment: { color: 'warning', label: 'Awaiting Payment' },
    paid: { color: 'success', label: 'Paid' },
    confirmed: { color: 'info', label: 'Confirmed' },
    cancelled: { color: 'error', label: 'Cancelled' },
  }

  if (!status) {
    return (
      <Badge variant="outline">
        No Status
      </Badge>
    )
  }

  const config = statusConfig[status] ?? { color: 'secondary' as const, label: 'Unknown' }
  return (
    <Badge color={config.color}>
      {config.label}
    </Badge>
  )
}
