'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addYears, subYears, setMonth, setYear } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon } from 'lucide-react'
import { parse } from 'date-fns'
import { isEmpty } from 'lodash'

interface MonthPickerProps {
  selected?: Date
  onSelect: (date: Date) => void
}

export function MonthPicker({ selected, onSelect }: MonthPickerProps) {
  const [viewDate, setViewDate] = React.useState(selected || new Date())

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const nextYear = () => setViewDate(addYears(viewDate, 1))
  const prevYear = () => setViewDate(subYears(viewDate, 1))

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(
      setYear(new Date(), viewDate.getFullYear()),
      monthIndex
    )
    onSelect(newDate)
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" onClick={prevYear}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold">{format(viewDate, 'yyyy')}</div>
        <Button variant="ghost" size="icon" onClick={nextYear}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <Button
            key={month}
            variant={
              selected &&
              selected.getMonth() === index &&
              selected.getFullYear() === viewDate.getFullYear()
                ? 'default'
                : 'ghost'
            }
            className="text-sm h-8"
            onClick={() => handleMonthSelect(index)}
          >
            {month.slice(0, 3)}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface MonthPickerPopoverProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MonthPickerPopover({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}: MonthPickerPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const date = !isEmpty(value) ? parse(value!, 'yyyy-MM', new Date()) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] pl-3 text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          {date ? (
            format(date, 'MMMM yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <MonthPicker
          selected={date}
          onSelect={(newDate) => {
            onChange(format(newDate, 'yyyy-MM'))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
