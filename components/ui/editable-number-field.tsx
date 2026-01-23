'use client'

import { Typography } from '@/components/ui/typography'
import { InlineNumberField } from '@/components/ui/inline-number-field'
import { isNil } from 'lodash'
import { z } from 'zod'

interface EditableNumberFieldProps {
  label: string
  value: number | null | undefined
  emptyText?: string
  canEdit: boolean
  onSave: (value: number | null) => Promise<void>
  schema?: z.ZodNumber
  formatDisplay?: (value: number) => string
}

export function EditableNumberField({
  label,
  value,
  emptyText = 'Not provided',
  canEdit,
  onSave,
  schema,
  formatDisplay,
}: EditableNumberFieldProps) {
  const displayValue = isNil(value)
    ? emptyText
    : formatDisplay
      ? formatDisplay(value)
      : value.toString()

  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      {canEdit ? (
        <InlineNumberField
          value={value ?? null}
          onSave={(newValue) => onSave(newValue)}
          emptyText={emptyText}
          schema={schema}
        />
      ) : (
        <Typography variant="p">{displayValue}</Typography>
      )}
    </div>
  )
}
