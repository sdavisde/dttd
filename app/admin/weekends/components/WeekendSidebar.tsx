'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { saveWeekendGroupFromSidebar, deleteWeekendGroup } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import {
  DateRange,
  addDays,
  buildMonthOptions,
  formatDateForApi,
  formatDateLabel,
  generateWeekendOptionsForMonth,
  getMonthKey,
  getNextThursdayRange,
  getWeekendTitle,
  inferMensWeekendFromGroup,
  isSameDay,
  normalizeDate,
} from '@/lib/weekend/scheduling'

interface WeekendSidebarProps {
  isOpen: boolean
  onClose: () => void
  weekendGroup: WeekendGroupWithId | null
}

export function WeekendSidebar({
  isOpen,
  onClose,
  weekendGroup,
}: WeekendSidebarProps) {
  const router = useRouter()
  const [isSaving, startSaving] = useTransition()
  const [isDeleting, startDeleting] = useTransition()
  const isEditing = Boolean(weekendGroup)
  const [title, setTitle] = useState('')
  const [mensRange, setMensRange] = useState<DateRange>(getNextThursdayRange())
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthKey(getNextThursdayRange().start)
  )
  const [isModifyingDates, setIsModifyingDates] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
      setShowDeleteDialog(false)
    }
  }, [isOpen])

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

    const payload = {
      groupId: weekendGroup?.groupId ?? null,
      title,
      mensStart: formatDateForApi(mensRange.start),
      mensEnd: formatDateForApi(mensRange.end),
      womensStart: formatDateForApi(womensRange.start),
      womensEnd: formatDateForApi(womensRange.end),
    }

    startSaving(async () => {
      const result = await saveWeekendGroupFromSidebar(payload)

      if (isErr(result)) {
        toast.error(
          isEditing
            ? 'Failed to update weekends'
            : 'Failed to create weekends',
          {
            description: result.error.message,
          }
        )
        return
      }

      toast.success(
        isEditing ? 'Weekends updated successfully' : 'Weekends created successfully'
      )
      router.refresh()
      onClose()
    })
  }

  const handleDeleteConfirm = () => {
    if (!weekendGroup) {
      return
    }

    startDeleting(async () => {
      const result = await deleteWeekendGroup(weekendGroup.groupId)

      if (isErr(result)) {
        toast.error('Failed to delete weekends', {
          description: result.error.message,
        })
        return
      }

      toast.success('Weekends deleted successfully')
      setShowDeleteDialog(false)
      router.refresh()
      onClose()
    })
  }

  const handleDeleteCancel = () => {
    if (isDeleting) {
      return
    }
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[420px] sm:w-[420px] overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader className="px-4 pb-0">
              <SheetTitle>
                {weekendGroup ? 'Edit Weekends' : 'Add Weekends'}
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

            <SheetFooter className="px-4 pb-4 gap-2 sm:flex-row sm:justify-between">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Weekends'}
                </Button>
              )}
              <Button type="submit" disabled={isSaving || isDeleting} className="sm:ml-auto">
                {isSaving
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Create Weekends'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName={title || 'Weekends'}
        title="Delete Weekends"
        description="This will remove both the mens and womens weekends. This action cannot be undone."
      />
    </>
  )
}
