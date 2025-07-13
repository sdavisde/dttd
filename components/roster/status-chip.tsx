import { Chip } from '@mui/material'

type RosterStatus = 'awaiting_payment' | 'paid' | 'confirmed' | 'cancelled'

interface RosterStatusChipProps {
  status: RosterStatus | null
}

export function RosterStatusChip({ status }: RosterStatusChipProps) {
  const statusConfig: Record<RosterStatus, { color: string; label: string }> = {
    awaiting_payment: { color: 'warning', label: 'Awaiting Payment' },
    paid: { color: 'success', label: 'Paid' },
    confirmed: { color: 'info', label: 'Confirmed' },
    cancelled: { color: 'error', label: 'Cancelled' },
  }

  if (!status) {
    return (
      <Chip
        label='No Status'
        color='default'
        size='small'
      />
    )
  }

  const config = statusConfig[status] ?? { color: 'default', label: 'Unknown' }
  return (
    <Chip
      label={config.label}
      color={config.color as any}
      size='small'
    />
  )
}
