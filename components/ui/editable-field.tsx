'use client'

import { Typography } from '@/components/ui/typography'
import { InlineTextField } from '@/components/ui/inline-text-field'

interface EditableFieldProps {
  label: string
  value: string | null | undefined
  emptyText?: string
  canEdit: boolean
  onSave: (value: string | null) => Promise<void>
}

export function EditableField({
  label,
  value,
  emptyText = 'Not provided',
  canEdit,
  onSave,
}: EditableFieldProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      {canEdit ? (
        <InlineTextField
          value={value ?? null}
          onSave={(newValue) => onSave(newValue ?? null)}
          emptyText={emptyText}
        />
      ) : (
        <Typography variant="p">{value ?? emptyText}</Typography>
      )}
    </div>
  )
}
