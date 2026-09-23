'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isNil } from 'lodash'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form } from '@/components/ui/form'
import type { WeekendGroupWithId } from '@/lib/weekend/types'
import { cn, setDatetimeToMidnight } from '@/lib/utils'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  saveWeekendGroupFromSidebar,
  deleteWeekendGroup,
} from '@/services/weekend'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import { toastError } from '@/lib/toast-error'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveStatusIndicator } from '@/components/auto-save/auto-save-status'
import { formatWeekendGroupTitle } from '@/lib/weekend'
import type { DateRange } from '@/lib/weekend/scheduling'
import {
  addDays,
  buildMonthOptions,
  formatDateForApi,
  formatDateLabel,
  generateWeekendOptionsForMonth,
  getMonthKey,
  getMensWeekendDateRange,
  isSameDay,
} from '@/lib/weekend/scheduling'

const weekendFormSchema = z.object({
  mensStartDate: z.date(),
  mensEndDate: z.date(),
  selectedMonth: z.string(),
})

type WeekendFormValues = z.infer<typeof weekendFormSchema>

interface WeekendSidebarProps {
  isOpen: boolean
  onClose: () => void
  weekendGroup: WeekendGroupWithId | null
  nextGroupNumber: number
}

function computeDefaultValues(
  weekendGroup: WeekendGroupWithId | null
): WeekendFormValues {
  const initial = getMensWeekendDateRange(weekendGroup)
  return {
    mensStartDate: initial.range.start,
    mensEndDate: initial.range.end,
    selectedMonth: getMonthKey(initial.range.start),
  }
}

export function WeekendSidebar({
  isOpen,
  onClose,
  weekendGroup,
  nextGroupNumber,
}: WeekendSidebarProps) {
  const router = useRouter()

  const weekendLabel = useMemo(() => {
    const number = weekendGroup?.weekends.MENS?.number ?? nextGroupNumber
    return formatWeekendGroupTitle(number)
  }, [weekendGroup, nextGroupNumber])

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (isNil(weekendGroup)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteWeekendGroup({ groupId: weekendGroup.groupId })

      if (isErr(result)) {
        toastError('Failed to delete weekends. Please try again.', {
          error: result.error,
        })
        return
      }

      toast.success('Weekends deleted successfully')
      setShowDeleteDialog(false)
      router.refresh()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (isDeleting) {
      return
    }
    setShowDeleteDialog(false)
  }

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setShowDeleteDialog(false)
    }
    onClose()
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-[420px] sm:w-[420px] overflow-y-auto">
          {/* Keyed per group so each one starts from its own saved dates. */}
          <WeekendSidebarForm
            key={weekendGroup?.groupId ?? 'new'}
            weekendGroup={weekendGroup}
            weekendLabel={weekendLabel}
            isDeleting={isDeleting}
            onRequestDelete={() => setShowDeleteDialog(true)}
            onClose={onClose}
          />
        </SheetContent>
      </Sheet>
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName={weekendLabel}
        title={`Delete ${weekendLabel}`}
        description="This will remove both the mens and womens weekends. This action cannot be undone."
      />
    </>
  )
}

interface WeekendSidebarFormProps {
  weekendGroup: WeekendGroupWithId | null
  weekendLabel: string
  isDeleting: boolean
  onRequestDelete: () => void
  onClose: () => void
}

/**
 * Creating a group waits for "Create Weekends"; an existing group saves as soon
 * as a different weekend is picked.
 */
function WeekendSidebarForm({
  weekendGroup,
  weekendLabel,
  isDeleting,
  onRequestDelete,
  onClose,
}: WeekendSidebarFormProps) {
  const router = useRouter()
  const isEditing = !isNil(weekendGroup)

  const form = useForm<WeekendFormValues>({
    resolver: zodResolver(weekendFormSchema),
    defaultValues: computeDefaultValues(weekendGroup),
  })

  const [isModifyingDates, setIsModifyingDates] = useState(false)

  const { isSubmitting } = form.formState

  // Get current form values
  const mensStartDate = form.watch('mensStartDate')
  const mensEndDate = form.watch('mensEndDate')
  const selectedMonth = form.watch('selectedMonth')

  const womensRange = useMemo(
    () => ({
      start: addDays(mensStartDate, 7),
      end: addDays(mensEndDate, 7),
    }),
    [mensStartDate, mensEndDate]
  )

  const monthOptions = useMemo(() => buildMonthOptions(new Date()), [])

  const weekendOptions = useMemo(
    () => generateWeekendOptionsForMonth(selectedMonth),
    [selectedMonth]
  )

  const toPayload = (mensStart: Date, mensEnd: Date) => ({
    groupId: weekendGroup?.groupId ?? null,
    mensStart: formatDateForApi(mensStart),
    mensEnd: formatDateForApi(mensEnd),
    womensStart: formatDateForApi(addDays(mensStart, 7)),
    womensEnd: formatDateForApi(addDays(mensEnd, 7)),
  })

  const autoSave = useAutoSave({
    value: toPayload(mensStartDate, mensEndDate),
    enabled: isEditing,
    delay: 0,
    errorMessage: 'Failed to update weekends. Please try again.',
    onSaved: () => router.refresh(),
    save: saveWeekendGroupFromSidebar,
  })

  const handleMonthChange = (month: string) => {
    form.setValue('selectedMonth', month)
    // An existing group only moves when a weekend is picked, so browsing
    // months doesn't save a new date.
    if (isEditing) return

    // Auto-select first weekend in the new month
    const newWeekendOptions = generateWeekendOptionsForMonth(month)
    if (newWeekendOptions.length > 0) {
      const firstOption = newWeekendOptions[0]
      form.setValue('mensStartDate', firstOption.start)
      form.setValue('mensEndDate', firstOption.end)
    }
  }

  const handleWeekendSelection = (range: DateRange) => {
    form.setValue('mensStartDate', setDatetimeToMidnight(range.start))
    form.setValue('mensEndDate', setDatetimeToMidnight(range.end))
  }

  // Only creating submits; an existing group auto-saves above.
  const onSubmit = async (data: WeekendFormValues) => {
    if (isEditing) return
    const result = await saveWeekendGroupFromSidebar(
      toPayload(data.mensStartDate, data.mensEndDate)
    )

    if (isErr(result)) {
      toastError('Failed to create weekends. Please try again.', {
        error: result.error,
      })
      return
    }

    toast.success('Weekends created successfully')
    router.refresh()
    onClose()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col"
      >
        <SheetHeader className="px-4 pb-0">
          <div className="flex items-center gap-3 pr-8">
            <SheetTitle>
              {isEditing ? `Edit ${weekendLabel}` : `Creating ${weekendLabel}`}
            </SheetTitle>
            <AutoSaveStatusIndicator
              status={autoSave.status}
              onRetry={autoSave.flush}
              className="ml-auto"
            />
          </div>
          <SheetDescription>
            {isEditing
              ? 'Pick a new weekend and it saves right away.'
              : 'Choose the dates for the mens weekend. Womens dates automatically follow by one week.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 flex-1">
          <div className="space-y-4 pt-2">
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
                {`${formatDateLabel(mensStartDate)} to ${formatDateLabel(mensEndDate)}`}
              </p>
            </div>

            {isModifyingDates && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={handleMonthChange}
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
                      const isSelected = isSameDay(option.start, mensStartDate)
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
              onClick={onRequestDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Weekends'}
            </Button>
          )}
          {!isEditing && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:ml-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create Weekends'}
            </Button>
          )}
        </SheetFooter>
      </form>
    </Form>
  )
}
