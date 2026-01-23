'use client'

import { Typography } from '@/components/ui/typography'
import { InlineTextArea } from '@/components/ui/inline-text-area'

interface EditableTextAreaProps {
  label: string
  value: string | null | undefined
  emptyText?: string
  canEdit: boolean
  onSave: (value: string | null) => Promise<void>
  rows?: number
}

export function EditableTextArea({
  label,
  value,
  emptyText = 'Not provided',
  canEdit,
  onSave,
  rows = 3,
}: EditableTextAreaProps) {
  return (
    <div>
      <Typography variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      {canEdit ? (
        <InlineTextArea
          value={value ?? null}
          onSave={(newValue) => onSave(newValue || null)}
          emptyText={emptyText}
          rows={rows}
        />
      ) : (
        <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
          {value ?? emptyText}
        </Typography>
      )}
    </div>
  )
}
