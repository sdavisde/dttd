'use client'

import { Typography } from '@/components/ui/typography'
import { InlineBooleanField } from '@/components/ui/inline-boolean-field'
import { isNil } from 'lodash'

interface EditableBooleanFieldProps {
  label: string
  value: boolean | null | undefined
  emptyText?: string
  trueLabel?: string
  falseLabel?: string
  canEdit: boolean
  onSave: (value: boolean | null) => Promise<void>
}

export function EditableBooleanField({
  label,
  value,
  emptyText = 'Not provided',
  trueLabel = 'Yes',
  falseLabel = 'No',
  canEdit,
  onSave,
}: EditableBooleanFieldProps) {
  const displayValue = isNil(value) ? emptyText : value ? trueLabel : falseLabel

  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      {canEdit ? (
        <InlineBooleanField
          value={value ?? null}
          onSave={(newValue) => onSave(newValue)}
          emptyText={emptyText}
          trueLabel={trueLabel}
          falseLabel={falseLabel}
        />
      ) : (
        <Typography variant="p">{displayValue}</Typography>
      )}
    </div>
  )
}
