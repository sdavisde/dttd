'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const dateValue = value ? new Date(value) : undefined

  async function handleSelect(selectedDate: Date | undefined) {
    if (!selectedDate) return

    const isoString = selectedDate.toISOString().split('T')[0]
    if (isoString !== value) {
      setIsSubmitting(true)
      try {
        await onSave(isoString)
      } finally {
        setIsSubmitting(false)
      }
    }
    setIsOpen(false)
  }

  const displayValue = dateValue ? format(dateValue, 'PPP') : ''
  const isEmpty = isNil(value)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 cursor-pointer rounded-md px-2 py-1 transition-colors',
            'hover:bg-muted',
            isEmpty && 'text-muted-foreground',
            isSubmitting && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {isEmpty ? emptyText : displayValue}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={isSubmitting}
          captionLayout="dropdown"
          startMonth={new Date(startYear, 0)}
          endMonth={new Date(endYear, 11)}
          defaultMonth={dateValue ?? new Date(endYear - 30, 0)}
        />
      </PopoverContent>
    </Popover>
  )
}
