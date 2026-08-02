'use client'

import * as React from 'react'
import {
  cn,
  formatDateNumeric,
  toISODateString,
  toLocalDateFromISO,
} from '@/lib/utils'
import { isNil } from 'lodash'
import { DateInput } from '@/components/ui/date-input'

interface InlineDateFieldProps {
  value: string | null // ISO date string
  onSave: (value: string) => Promise<void>
  emptyText?: string
  className?: string
  startYear?: number
  endYear?: number
}

export function InlineDateField({
  value,
  onSave,
  emptyText = 'Not set',
  className,
  startYear = 1920,
  endYear = new Date().getFullYear(),
}: InlineDateFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // `new Date(value)` would read a date-only string as UTC midnight and render
  // a day early for viewers behind UTC; toLocalDateFromISO builds it locally.
  const dateValue = toLocalDateFromISO(value) ?? undefined

  async function handleDateChange(selectedDate: Date | undefined) {
    if (isNil(selectedDate)) return

    const isoString = toISODateString(selectedDate)
    if (isoString !== value) {
      setIsSubmitting(true)
      try {
        await onSave(isoString)
      } finally {
        setIsSubmitting(false)
      }
    }
    setIsEditing(false)
  }

  if (!isEditing) {
    const displayValue = !isNil(dateValue) ? formatDateNumeric(dateValue) : ''
    const isEmpty = isNil(value)

    return (
      <span
        onClick={() => !isSubmitting && setIsEditing(true)}
        className={cn(
          'inline-flex items-center gap-1 cursor-pointer rounded-md px-2 py-1 transition-colors',
          'hover:bg-muted',
          isEmpty && 'text-muted-foreground',
          isSubmitting && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isEmpty ? emptyText : displayValue}
      </span>
    )
  }

  return (
    <DateInput
      date={dateValue}
      onDateChange={handleDateChange}
      disabled={isSubmitting}
      minDate={new Date(startYear, 0, 1)}
      maxDate={new Date(endYear, 11, 31)}
      className={cn('w-[160px]', className)}
    />
  )
}
