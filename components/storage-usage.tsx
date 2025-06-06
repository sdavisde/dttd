'use client'

import { LinearProgress, Paper, Typography, Box } from '@mui/material'

type StorageUsageProps = {
  usedBytes: number
  totalBytes: number
}

export function StorageUsage({ usedBytes, totalBytes }: StorageUsageProps) {
  console.log(usedBytes, totalBytes)
  const usedGB = usedBytes / (1024 * 1024 * 1024)
  const totalGB = totalBytes / (1024 * 1024 * 1024)
  const percentage = (usedBytes / totalBytes) * 100
  console.log(usedGB, totalGB, percentage)

  return (
    <Paper
      elevation={2}
      sx={{ p: 2, mb: 2 }}
    >
      <Typography
        variant='h6'
        gutterBottom
      >
        Storage Usage
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant='determinate'
            value={percentage}
            color={percentage > 90 ? 'error' : percentage > 75 ? 'warning' : 'primary'}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant='body2'
            color='text.secondary'
          >
            {percentage.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      <Typography
        variant='body2'
        color='text.secondary'
      >
        {usedGB.toFixed(2)} GB used of {totalGB.toFixed(2)} GB
      </Typography>
    </Paper>
  )
}
