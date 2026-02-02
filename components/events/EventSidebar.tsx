'use client'

import { Trash2 } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { type Event } from '@/services/events'

import { useEventForm } from './hooks/use-event-form'
import { EventFormFields } from './event-form-fields'
import { WeekendOption } from './event-form-schema'

// Re-export for backwards compatibility
export type { WeekendOption } from './event-form-schema'

interface EventSidebarProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
  weekendOptions?: WeekendOption[]
}

export function EventSidebar({
  isOpen,
  onClose,
  event,
  weekendOptions = [],
}: EventSidebarProps) {
  const {
    form,
    isEditing,
    isSubmitting,
    isDeleting,
    showDeleteDialog,
    setShowDeleteDialog,
    hasEndDateTime,
    isSaveDisabled,
    handleSubmit,
    handleDelete,
    handleClose,
  } = useEventForm({ event, onClose })

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
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <EventFormFields
              form={form}
              hasEndDateTime={hasEndDateTime}
              weekendOptions={weekendOptions}
            />

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
        onConfirm={handleDelete}
        confirmText="Delete Event"
      />
    </Sheet>
  )
}
