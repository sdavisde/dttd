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
import { AutoSaveStatusIndicator } from '@/components/auto-save/auto-save-status'
import { type Event } from '@/services/events'

import { useEventForm } from './hooks/use-event-form'
import { EventFormFields } from './event-form-fields'
import type {
  WeekendOption,
  WeekendIndividualOption,
  EventFormPrefill,
} from './event-form-schema'

// Re-export for backwards compatibility
export type {
  WeekendOption,
  WeekendIndividualOption,
  EventFormPrefill,
} from './event-form-schema'

interface EventSidebarProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
  weekendOptions?: WeekendOption[]
  weekendIndividualOptions?: WeekendIndividualOption[]
  prefill?: EventFormPrefill
}

export function EventSidebar({ isOpen, onClose, ...rest }: EventSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      {/* A fixed 400px panel overflows a 375px phone, so the sheet takes the
          screen below `sm` and settles at the board's panel width above it. */}
      <SheetContent className="w-full sm:w-[420px] sm:max-w-[420px]">
        {/* Keyed per event so each one starts from its own saved values. */}
        <EventSidebarBody
          key={rest.event?.id ?? 'new'}
          onClose={onClose}
          {...rest}
        />
      </SheetContent>
    </Sheet>
  )
}

function EventSidebarBody({
  onClose,
  event,
  weekendOptions = [],
  weekendIndividualOptions = [],
  prefill,
}: Omit<EventSidebarProps, 'isOpen'>) {
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
    saveStatus,
    retrySave,
  } = useEventForm({ event, onClose, prefill, weekendIndividualOptions })

  return (
    <>
      <SheetHeader className="gap-1.5 pb-0">
        <div className="flex items-center gap-3 pr-8">
          <SheetTitle className="font-serif text-lg tracking-tight">
            {isEditing ? 'Edit event' : 'New event'}
          </SheetTitle>
          <AutoSaveStatusIndicator
            status={saveStatus}
            onRetry={retrySave}
            className="ml-auto"
          />
        </div>
        <SheetDescription>
          {isEditing
            ? 'Changes save as you go, and the calendar picks them up right away.'
            : 'Anything with a date goes here. It shows on the calendar as soon as you save.'}
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EventFormFields
              form={form}
              hasEndDateTime={hasEndDateTime}
              weekendOptions={weekendOptions}
              weekendIndividualOptions={weekendIndividualOptions}
              prefill={prefill}
            />
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-divider">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSaveDisabled}
                className="w-full"
              >
                {isSubmitting ? 'Creating...' : 'Create event'}
              </Button>
            )}
          </SheetFooter>
        </form>
      </Form>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Event"
        itemName={event?.title ?? 'this event'}
        isDeleting={isDeleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        confirmText="Delete Event"
      />
    </>
  )
}
