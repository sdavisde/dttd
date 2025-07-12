'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { Database } from '@/database.types'

type Weekend = Database['public']['Tables']['weekends']['Row']

interface SelectWeekendModalProps {
  open: boolean
  onClose: () => void
  weekends: Weekend[]
  onSubmit: (weekendId: string) => void
  title?: string
  submitButtonText?: string
}

export function SelectWeekendModal({
  open,
  onClose,
  weekends,
  onSubmit,
  title = 'Select Weekend',
  submitButtonText = 'Continue',
}: SelectWeekendModalProps) {
  const [selectedWeekendId, setSelectedWeekendId] = useState<string>('')

  const handleSubmit = () => {
    if (selectedWeekendId) {
      onSubmit(selectedWeekendId)
      onClose()
      setSelectedWeekendId('')
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedWeekendId('')
  }

  // todo: probably makes sense to move this into a common component or helper function
  const formatWeekendDisplay = (weekend: Weekend) => {
    const startDate = new Date(weekend.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endDate = new Date(weekend.end_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const type = weekend.type === 'MENS' ? "Men's" : "Women's"
    const number = weekend.number ? ` #${weekend.number}` : ''

    return `${type} Weekend${number} (${startDate} - ${endDate})`
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2 }}
          >
            Please select the weekend you would like to pay team fees for:
          </Typography>

          <FormControl fullWidth>
            <InputLabel id='weekend-select-label'>Weekend</InputLabel>
            <Select
              labelId='weekend-select-label'
              id='weekend-select'
              value={selectedWeekendId}
              label='Weekend'
              onChange={(e) => setSelectedWeekendId(e.target.value)}
            >
              {weekends.map((weekend) => (
                <MenuItem
                  key={weekend.id}
                  value={weekend.id}
                >
                  {formatWeekendDisplay(weekend)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!selectedWeekendId}
        >
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
