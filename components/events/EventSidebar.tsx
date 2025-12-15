'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import {
  type Event,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/actions/events'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'

const CT_TIMEZONE = 'America/Chicago'

const eventFormSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  date: z.date({ error: 'Date is required' }),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
})

type EventFormData = z.infer<typeof eventFormSchema>

interface EventSidebarProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
}

export function EventSidebar({ isOpen, onClose, event }: EventSidebarProps) {
  const isEditing = !!event
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [originalFormData, setOriginalFormData] =
    useState<EventFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      time: '09:00', // Default to 9 AM CT
      location: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (isEditing && event) {
      const resetData: Partial<EventFormData> = {
        title: event.title ?? '',
        time: '09:00',
        location: event.location ?? '',
      }

      if (event.datetime) {
        // Convert UTC datetime to CT for display
        const utcDate = new Date(event.datetime)
        const ctDate = toZonedTime(utcDate, CT_TIMEZONE)
        resetData.date = ctDate
        resetData.time = format(ctDate, 'HH:mm')
      }

      const formData = resetData as EventFormData
      form.reset(formData)
      setOriginalFormData(formData)
    } else {
      // Reset form for adding new event
      const defaultData: EventFormData = {
        title: '',
        date: new Date(),
        time: '09:00', // Default to 9 AM CT
        location: '',
      }
      form.reset(defaultData)
      setOriginalFormData(null)
    }
  }, [isEditing, event, form])

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      // Combine date and time in CT, then convert to UTC
      const [hours, minutes] = data.time.split(':').map(Number)
      const ctDateTime = new Date(data.date)
      ctDateTime.setHours(hours, minutes, 0, 0)

      // Convert CT time to UTC for storage
      const utcDateTime = fromZonedTime(ctDateTime, CT_TIMEZONE)

      const eventData = {
        title: data.title,
        datetime: utcDateTime.toISOString(),
        location: data.location || null,
      }

      if (isEditing && event) {
        const result = await updateEvent(event.id, eventData)
        if (isErr(result)) {
          throw new Error(result.error)
        }
        toast.success('Event updated successfully')
        router.refresh()
        handleClose()
      } else {
        const result = await createEvent(eventData)
        if (isErr(result)) {
          throw new Error(result.error)
        }
        toast.success('Event created successfully')
        router.refresh()
        handleClose()
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
      console.error('Error saving event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!event || !isEditing) return

    setIsDeleting(true)
    try {
      const result = await deleteEvent(event.id)
      if (isErr(result)) {
        throw new Error(result.error)
      }
      toast.success('Event deleted successfully')
      setShowDeleteDialog(false)
      router.refresh()
      handleClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete event'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    form.reset({
      title: '',
      date: new Date(),
      time: '09:00', // Default to 9 AM CT
      location: '',
    })
    setShowDeleteDialog(false)
    setOriginalFormData(null)
    onClose()
  }

  // Check if form has changes
  const currentFormData = form.watch()
  const hasChanges = originalFormData
    ? JSON.stringify({
        title: currentFormData.title,
        date: currentFormData.date?.toISOString(),
        time: currentFormData.time,
        location: currentFormData.location,
      }) !==
      JSON.stringify({
        title: originalFormData.title,
        date: originalFormData.date?.toISOString(),
        time: originalFormData.time,
        location: originalFormData.location,
      })
    : currentFormData.title !== '' ||
      currentFormData.date?.toDateString() !== new Date().toDateString() ||
      currentFormData.time !== '09:00' ||
      currentFormData.location !== ''

  const isFormValid = form.formState.isValid
  const isSaveDisabled =
    !isFormValid || (isEditing && !hasChanges) || isSubmitting

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the event details below.'
              : 'Create a new event by filling out the form below.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="space-y-4 px-4 flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Event Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Team Meeting 1"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Date *
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select a date"
                        className="w-full"
                        startMonth={new Date(new Date().getFullYear() - 2, 0)}
                        endMonth={new Date(new Date().getFullYear() + 3, 11)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Time (CT) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        step="900"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Location *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event location..."
                        className="min-h-[80px]"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <div className="flex gap-2 w-full">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting || isSubmitting}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSaveDisabled || isDeleting}
                  className={isEditing ? 'flex-1' : 'w-full'}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Save Changes'
                      : 'Create Event'}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Event"
        itemName={event?.title ?? 'this event'}
        isDeleting={isDeleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Event"
      />
    </Sheet>
  )
}
