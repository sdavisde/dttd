'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  contentClassName,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const currentYear = new Date().getFullYear()

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-slot='date-picker-trigger'
          data-empty={!date}
          disabled={disabled}
          className={cn('w-[280px] justify-start text-left font-normal', className)}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-slot='date-picker-content'
        className={cn('w-auto p-0', contentClassName)}
      >
        <Calendar
          mode='single'
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate)
            setOpen(false)
          }}
          disabled={disabled}
          captionLayout='dropdown'
          fromYear={currentYear - 2}
          toYear={currentYear + 3}
        />
      </PopoverContent>
    </Popover>
  )
}
