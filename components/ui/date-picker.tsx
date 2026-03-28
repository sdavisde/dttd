'use client'

import { DateInput } from '@/components/ui/date-input'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  startMonth: Date
  endMonth: Date
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'MM/DD/YYYY',
  disabled = false,
  className,
  startMonth,
  endMonth,
}: DatePickerProps) {
  return (
    <DateInput
      date={date}
      onDateChange={onDateChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn('w-[280px]', className)}
      minDate={startMonth}
      maxDate={endMonth}
    />
  )
}
