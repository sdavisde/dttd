'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { WeekendGroupWithId } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  saveWeekendGroupFromSidebar,
  deleteWeekendGroup,
} from '@/actions/weekend'
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
  getWeekendTitle,
  getMensWeekendDateRange,
  isSameDay,
  normalizeDate,
} from '@/lib/weekend/scheduling'

const weekendFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  mensStartDate: z.date(),
  mensEndDate: z.date(),
})

type WeekendFormValues = z.infer<typeof weekendFormSchema>

interface WeekendSidebarProps {
  isOpen: boolean
  onClose: () => void
  weekendGroup: WeekendGroupWithId | null
}

function computeDefaultValues(
  weekendGroup: WeekendGroupWithId | null
): WeekendFormValues {
  const initial = getMensWeekendDateRange(weekendGroup)
  return {
    title: getWeekendTitle(weekendGroup?.weekends.MENS ?? null) ?? '',
    mensStartDate: initial.range.start,
    mensEndDate: initial.range.end,
  }
}

export function WeekendSidebar({
  isOpen,
  onClose,
  weekendGroup,
}: WeekendSidebarProps) {
  const router = useRouter()
  const isEditing = Boolean(weekendGroup)
  const initialDateRange = getMensWeekendDateRange(weekendGroup)

  // Form state managed by React Hook Form
  const form = useForm<WeekendFormValues>({
    resolver: zodResolver(weekendFormSchema),
    defaultValues: computeDefaultValues(weekendGroup),
  })

  // UI-only state
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthKey(initialDateRange.range.start)
  )
  const [isModifyingDates, setIsModifyingDates] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get form state
  const { isSubmitting } = form.formState

  // Reset form when weekendGroup changes
  useEffect(() => {
    const defaultValues = computeDefaultValues(weekendGroup)
    form.reset(defaultValues)
    setSelectedMonth(getMonthKey(defaultValues.mensStartDate))
  }, [weekendGroup, form])

  // Get current form values
  const mensStartDate = form.watch('mensStartDate')
  const mensEndDate = form.watch('mensEndDate')

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

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)

    // Auto-select first weekend in the new month
    const newWeekendOptions = generateWeekendOptionsForMonth(month)
    if (newWeekendOptions.length > 0) {
      const firstOption = newWeekendOptions[0]
      form.setValue('mensStartDate', firstOption.start)
      form.setValue('mensEndDate', firstOption.end)
    }
  }

  const handleWeekendSelection = (range: DateRange) => {
    form.setValue('mensStartDate', normalizeDate(range.start))
    form.setValue('mensEndDate', normalizeDate(range.end))
  }

  const onSubmit = async (data: WeekendFormValues) => {
    const payload = {
      groupId: weekendGroup?.groupId ?? null,
      title: data.title,
      mensStart: formatDateForApi(data.mensStartDate),
      mensEnd: formatDateForApi(data.mensEndDate),
      womensStart: formatDateForApi(womensRange.start),
      womensEnd: formatDateForApi(womensRange.end),
    }

    const result = await saveWeekendGroupFromSidebar(payload)

    if (isErr(result)) {
      toast.error(
        isEditing ? 'Failed to update weekends' : 'Failed to create weekends',
        {
          description: result.error.message,
        }
      )
      return
    }

    toast.success(
      isEditing
        ? 'Weekends updated successfully'
        : 'Weekends created successfully'
    )
    router.refresh()
    onClose()
  }

  const handleDeleteConfirm = async () => {
    if (!weekendGroup) {
      return
    }

    setIsDeleting(true)
    try {
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
      form.reset()
    }
    onClose()
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-[420px] sm:w-[420px] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex h-full flex-col"
            >
              <SheetHeader className="px-4 pb-0">
                <SheetTitle>
                  {weekendGroup ? 'Edit Weekends' : 'Add Weekends'}
                </SheetTitle>
                <SheetDescription>
                  Configure the weekend details. Womens dates automatically
                  follow the mens weekend by one week.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 flex-1">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>Weekend Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ex: DTTD #11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                              mensStartDate
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
                    disabled={isSubmitting || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Weekends'}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="sm:ml-auto"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Weekends'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName={form.getValues('title') || 'Weekends'}
        title="Delete Weekends"
        description="This will remove both the mens and womens weekends. This action cannot be undone."
      />
    </>
  )
}
