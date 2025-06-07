'use client'

import { Box, Chip, useTheme, useMediaQuery } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { CandidateStatus } from '@/lib/candidates/types'

const STATUSES: Array<{ id: CandidateStatus; label: string; color: string }> = [
  { id: 'sponsored', label: 'Sponsored', color: 'default' },
  { id: 'awaiting_forms', label: 'Awaiting Forms', color: 'warning' },
  { id: 'pending_approval', label: 'Pending Approval', color: 'info' },
  { id: 'awaiting_payment', label: 'Awaiting Payment', color: 'secondary' },
  { id: 'confirmed', label: 'Confirmed', color: 'success' },
]

interface StatusFlowProps {
  currentStatus?: CandidateStatus
}

export function StatusFlow({ currentStatus }: StatusFlowProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: 0.5,
        my: 2,
      }}
    >
      {STATUSES.map((status, index) => (
        <Box
          key={status.id}
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
          }}
        >
          <Chip
            label={status.label}
            color={status.color as any}
            variant={currentStatus === status.id ? 'filled' : 'outlined'}
            sx={{
              minWidth: 100,
              fontWeight: currentStatus === status.id ? 'bold' : 'normal',
            }}
          />
          {index < STATUSES.length - 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mx: 1,
                color: 'text.secondary',
              }}
            >
              {isMobile ? <ArrowDownwardIcon /> : <ArrowForwardIcon />}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
