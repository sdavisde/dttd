'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WeekendGroupWithId, Weekend } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

type DateRange = {
  start: Date
  end: Date
}

type MonthOption = {
  label: string
  value: string
}

type WeekendOption = DateRange & {
  label: string
  key: string
}

interface WeekendSidebarProps {
  isOpen: boolean
  onClose: () => void
  weekendGroup: WeekendGroupWithId | null
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const normalizeDate = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const getNextThursdayRange = (reference = new Date()): DateRange => {
  const next = normalizeDate(reference)
  let daysAhead = (4 - next.getDay() + 7) % 7
  if (daysAhead === 0) {
    daysAhead = 7
  }
  const start = addDays(next, daysAhead)
  const end = addDays(start, 3)
  return { start, end }
}

const inferMensWeekendFromGroup = (
  group: WeekendGroupWithId | null
): { title: string; range: DateRange } => {
  if (!group) {
    const nextRange = getNextThursdayRange()
    return { title: '', range: nextRange }
  }

  const mensWeekend = group.weekends.MENS
  const womensWeekend = group.weekends.WOMENS

  const mensStart = mensWeekend?.start_date
    ? new Date(mensWeekend.start_date)
    : womensWeekend?.start_date
      ? addDays(new Date(womensWeekend.start_date), -7)
      : null
  const mensEnd = mensWeekend?.end_date
    ? new Date(mensWeekend.end_date)
    : womensWeekend?.end_date
      ? addDays(new Date(womensWeekend.end_date), -7)
      : null

  if (mensStart && mensEnd) {
    return {
      title: mensWeekend?.title ?? womensWeekend?.title ?? '',
      range: {
        start: normalizeDate(mensStart),
        end: normalizeDate(mensEnd),
      },
    }
  }

  const nextRange = getNextThursdayRange()
  return {
    title: mensWeekend?.title ?? womensWeekend?.title ?? '',
    range: nextRange,
  }
}

const buildMonthOptions = (startDate: Date, count = 12): MonthOption[] => {
  const options: MonthOption[] = []
  for (let offset = 0; offset < count; offset++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + offset, 1)
    const label = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    options.push({
      label,
      value: getMonthKey(date),
    })
  }
  return options
}

const generateWeekendOptionsForMonth = (key: string): WeekendOption[] => {
  const [yearStr, monthStr] = key.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr) - 1
  const firstOfMonth = new Date(year, month, 1)
  const firstThursday = new Date(firstOfMonth)
  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1)
  }

  const options: WeekendOption[] = []
  let cursor = normalizeDate(firstThursday)

  while (cursor.getMonth() === month) {
    const start = new Date(cursor)
    const end = addDays(start, 3)
    const keyValue = `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(
      0,
      10
    )}`
    options.push({
      start,
      end,
      key: keyValue,
      label: `${formatDateLabel(start)} - ${formatDateLabel(end)}`,
    })
    cursor = addDays(cursor, 7)
  }

  return options
}

const isSameDay = (a: Date, b: Date) =>
  Math.abs(normalizeDate(a).getTime() - normalizeDate(b).getTime()) <
  MILLISECONDS_IN_DAY

const getWeekendTitle = (weekend: Weekend | null) => {
  if (!weekend) {
    return ''
  }

  if (weekend.title) {
    return weekend.title
  }

  if (typeof weekend.number === 'number') {
    return `Weekend #${weekend.number}`
  }

  return ''
}

export function WeekendSidebar({
  isOpen,
  onClose,
  weekendGroup,
}: WeekendSidebarProps) {
  const [title, setTitle] = useState('')
  const [mensRange, setMensRange] = useState<DateRange>(getNextThursdayRange())
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthKey(getNextThursdayRange().start)
  )
  const [isModifyingDates, setIsModifyingDates] = useState(false)

  const womensRange = useMemo(
    () => ({
      start: addDays(mensRange.start, 7),
      end: addDays(mensRange.end, 7),
    }),
    [mensRange]
  )

  const monthOptions = useMemo(
    () => buildMonthOptions(new Date()),
    []
  )

  const weekendOptions = useMemo(
    () => generateWeekendOptionsForMonth(selectedMonth),
    [selectedMonth]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const initial = inferMensWeekendFromGroup(weekendGroup)
    setTitle(
      initial.title ||
      getWeekendTitle(weekendGroup?.weekends.MENS ?? null) ||
      ''
    )
    setMensRange(initial.range)
    setSelectedMonth(getMonthKey(initial.range.start))
    setIsModifyingDates(false)
  }, [isOpen, weekendGroup])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const hasMatch = weekendOptions.some((option) =>
      isSameDay(option.start, mensRange.start)
    )

    if (weekendOptions.length > 0 && !hasMatch) {
      const firstOption = weekendOptions[0]
      setMensRange({ start: firstOption.start, end: firstOption.end })
    }
  }, [selectedMonth, weekendOptions, mensRange.start, isOpen])

  const handleWeekendSelection = (range: DateRange) => {
    setMensRange({
      start: normalizeDate(range.start),
      end: normalizeDate(range.end),
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // TODO: Integrate create/update weekend actions.
    console.log('Weekend sidebar submit', {
      title,
      mensStart: mensRange.start.toISOString(),
      mensEnd: mensRange.end.toISOString(),
      womensStart: womensRange.start.toISOString(),
      womensEnd: womensRange.end.toISOString(),
      weekendGroupId: weekendGroup?.groupId ?? null,
    })

    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[420px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="px-4 pb-0">
            <SheetTitle>
              {weekendGroup ? 'Edit Weekend Group' : 'Add Weekend Group'}
            </SheetTitle>
            <SheetDescription>
              Configure the weekend details. Womens dates automatically follow the
              mens weekend by one week.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4 flex-1">
            <div className="space-y-3 pt-2">
              <Label htmlFor="weekend-title">Weekend Title</Label>
              <Input
                id="weekend-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter weekend title"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Mens</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModifyingDates((value) => !value)}
                >
                  {isModifyingDates ? 'Done' : 'Modify Dates'}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <p className="text-sm text-muted-foreground">
                  {`${formatDateLabel(mensRange.start)} to ${formatDateLabel(mensRange.end)}`}
                </p>
              </div>

              {isModifyingDates && (
                <div className="space-y-4 rounded-md border p-4">
                  <div className="space-y-2">
                    <Label>Select Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Weekend</Label>
                    <div className="grid gap-2">
                      {weekendOptions.map((option) => {
                        const isSelected = isSameDay(
                          option.start,
                          mensRange.start
                        )
                        return (
                          <Button
                            key={option.key}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className={cn(
                              'justify-start text-left',
                              isSelected && 'border-primary'
                            )}
                            onClick={() =>
                              handleWeekendSelection({
                                start: option.start,
                                end: option.end,
                              })
                            }
                          >
                            {option.label}
                          </Button>
                        )
                      })}
                      {weekendOptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No weekend ranges found for this month.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Womens</h3>
              <div className="grid grid-cols-1 gap-3">
                <p className="text-sm text-muted-foreground">
                  {`${formatDateLabel(womensRange.start)} to ${formatDateLabel(womensRange.end)}`}
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 pb-4">
            <Button type="submit">
              {weekendGroup ? 'Save Changes' : 'Create Weekend Group'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
