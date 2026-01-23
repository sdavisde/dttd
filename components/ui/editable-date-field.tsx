'use client'

import { format } from 'date-fns'
import { Typography } from '@/components/ui/typography'
import { InlineDateField } from '@/components/ui/inline-date-field'
import { isNil } from 'lodash'
import { Pencil } from 'lucide-react'

interface EditableDateFieldProps {
  label: string
  value: string | null | undefined // ISO date string
  emptyText?: string
  canEdit: boolean
  onSave: (value: string | null) => Promise<void>
  startYear?: number
  endYear?: number
}

export function EditableDateField({
  label,
  value,
  emptyText = 'Not provided',
  canEdit,
  onSave,
  startYear,
  endYear,
}: EditableDateFieldProps) {
  const displayValue = isNil(value) ? emptyText : format(new Date(value), 'PPP')

  return (
    <div>
      <Typography
        variant="small"
        className="text-muted-foreground flex items-center gap-1"
      >
        {label}
        {canEdit && <Pencil className="h-3 w-3" />}
      </Typography>
      {canEdit ? (
        <InlineDateField
          value={value ?? null}
          onSave={(newValue) => onSave(newValue)}
          emptyText={emptyText}
          startYear={startYear}
          endYear={endYear}
        />
      ) : (
        <Typography variant="p">{displayValue}</Typography>
      )}
    </div>
  )
}
