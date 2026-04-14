'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toastError } from '@/lib/toast-error'

import { type Event } from '@/services/events'
import { createEvent, updateEvent, deleteEvent } from '@/services/events'
import {
  type EventTypeValue,
  SINGLETON_EVENT_TYPES,
} from '@/services/events/types'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import type {
  EventFormData,
  EventFormPrefill,
  WeekendIndividualOption,
} from '../event-form-schema'
import {
  eventFormSchema,
  DEFAULT_FORM_VALUES,
  CT_TIMEZONE,
} from '../event-form-schema'

interface UseEventFormProps {
  event?: Event | null
  onClose: () => void
  prefill?: EventFormPrefill
  weekendIndividualOptions?: WeekendIndividualOption[]
}

export function useEventForm({
  event,
  onClose,
  prefill,
  weekendIndividualOptions = [],
}: UseEventFormProps) {
  const isEditing = !isNil(event)
  const router = useRouter()
  const [originalFormData, setOriginalFormData] =
    useState<EventFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const hasEndDateTime = form.watch('hasEndDateTime')

  // Populate form when editing
  useEffect(() => {
    if (isEditing && !isNil(event)) {
      const resetData: Partial<EventFormData> = {
        title: event.title ?? '',
        time: '09:00',
        location: event.location ?? '',
        type: event.type ?? null,
        hasEndDateTime: !isNil(event.endDatetime),
        endDate: null,
        endTime: null,
        weekendGroupId: event.weekendGroupId ?? null,
        weekendId: event.weekendId ?? null,
      }

      if (!isNil(event.datetime)) {
        const utcDate = new Date(event.datetime)
        const ctDate = toZonedTime(utcDate, CT_TIMEZONE)
        resetData.date = ctDate
        resetData.time = format(ctDate, 'HH:mm')
      }

      if (!isNil(event.endDatetime)) {
        const utcEndDate = new Date(event.endDatetime)
        const ctEndDate = toZonedTime(utcEndDate, CT_TIMEZONE)
        resetData.endDate = ctEndDate
        resetData.endTime = format(ctEndDate, 'HH:mm')
      }

      const formData = resetData as EventFormData
      form.reset(formData)
      setOriginalFormData(formData)
    } else {
      const createDefaults = !isNil(prefill)
        ? {
            ...DEFAULT_FORM_VALUES,
            title: prefill.title ?? '',
            type: prefill.type ?? null,
            weekendGroupId: prefill.weekendGroupId ?? null,
            weekendId: prefill.weekendId ?? null,
          }
        : DEFAULT_FORM_VALUES
      form.reset(createDefaults)
      setOriginalFormData(null)
    }
  }, [isEditing, event, form, prefill])

  // When type changes to a group type, clear weekendId since it's not applicable
  const watchedType = form.watch('type') as EventTypeValue | null | undefined
  const isSingletonType =
    watchedType != null && SINGLETON_EVENT_TYPES.includes(watchedType)
  useEffect(() => {
    if (!isSingletonType) {
      form.setValue('weekendId', null)
    }
  }, [isSingletonType, form])

  // When weekendId is selected, auto-set weekendGroupId from the individual weekend's group
  const watchedWeekendId = form.watch('weekendId')
  useEffect(() => {
    if (!isNil(watchedWeekendId)) {
      const match = weekendIndividualOptions.find(
        (w) => w.id === watchedWeekendId
      )
      if (!isNil(match) && form.getValues('weekendGroupId') !== match.groupId) {
        form.setValue('weekendGroupId', match.groupId)
      }
    }
  }, [watchedWeekendId, weekendIndividualOptions, form])

  // When weekendGroupId changes, clear weekendId if it no longer belongs to the selected group
  const watchedGroupId = form.watch('weekendGroupId')
  useEffect(() => {
    if (!isNil(watchedWeekendId) && !isNil(watchedGroupId)) {
      const match = weekendIndividualOptions.find(
        (w) => w.id === watchedWeekendId
      )
      if (!isNil(match) && match.groupId !== watchedGroupId) {
        form.setValue('weekendId', null)
      }
    }
  }, [watchedGroupId, watchedWeekendId, weekendIndividualOptions, form])

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      const [hours, minutes] = data.time.split(':').map(Number)
      const ctDateTime = new Date(data.date)
      ctDateTime.setHours(hours, minutes, 0, 0)
      const utcDateTime = fromZonedTime(ctDateTime, CT_TIMEZONE)

      let endDatetimeUtc: string | null = null
      if (data.hasEndDateTime && !isNil(data.endDate) && !isNil(data.endTime)) {
        const [endHours, endMinutes] = data.endTime.split(':').map(Number)
        const ctEndDateTime = new Date(data.endDate)
        ctEndDateTime.setHours(endHours, endMinutes, 0, 0)
        endDatetimeUtc = fromZonedTime(ctEndDateTime, CT_TIMEZONE).toISOString()
      }

      const dataType = (data.type as EventTypeValue) ?? null
      const isSubmittingSingleton =
        dataType != null && SINGLETON_EVENT_TYPES.includes(dataType)

      // For singleton types, derive weekendGroupId from the selected individual weekend
      // For group types, clear weekendId since it doesn't apply
      let weekendGroupId = data.weekendGroupId ?? null
      let weekendId = data.weekendId ?? null
      if (isSubmittingSingleton && !isNil(weekendId)) {
        const match = weekendIndividualOptions.find((w) => w.id === weekendId)
        if (!isNil(match)) weekendGroupId = match.groupId
      } else if (!isSubmittingSingleton) {
        weekendId = null
      }

      const eventData = {
        title: data.title,
        datetime: utcDateTime.toISOString(),
        location: data.location ?? null,
        type: dataType,
        end_datetime: endDatetimeUtc,
        weekend_group_id: weekendGroupId,
        weekend_id: weekendId,
      }

      if (isEditing && !isNil(event)) {
        const result = await updateEvent(event.id, eventData)
        if (isErr(result)) {
          throw new Error(result.error)
        }
        toast.success('Event updated successfully')
      } else {
        const result = await createEvent(eventData)
        if (isErr(result)) {
          throw new Error(result.error)
        }
        toast.success('Event created successfully')
      }
      router.refresh()
      handleClose()
    } catch (error) {
      toastError('Unable to save event. Please try again.', { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (isNil(event) || !isEditing) return

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
      toastError('Unable to delete event. Please try again.', { error })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    form.reset(DEFAULT_FORM_VALUES)
    setShowDeleteDialog(false)
    setOriginalFormData(null)
    onClose()
  }

  // Check if form has changes
  const currentFormData = form.watch()
  const hasChanges = !isNil(originalFormData)
    ? JSON.stringify({
        title: currentFormData.title,
        date: currentFormData.date?.toISOString(),
        time: currentFormData.time,
        location: currentFormData.location,
        type: currentFormData.type,
        hasEndDateTime: currentFormData.hasEndDateTime,
        endDate: currentFormData.endDate?.toISOString(),
        endTime: currentFormData.endTime,
        weekendGroupId: currentFormData.weekendGroupId,
        weekendId: currentFormData.weekendId,
      }) !==
      JSON.stringify({
        title: originalFormData.title,
        date: originalFormData.date?.toISOString(),
        time: originalFormData.time,
        location: originalFormData.location,
        type: originalFormData.type,
        hasEndDateTime: originalFormData.hasEndDateTime,
        endDate: originalFormData.endDate?.toISOString(),
        endTime: originalFormData.endTime,
        weekendGroupId: originalFormData.weekendGroupId,
        weekendId: originalFormData.weekendId,
      })
    : currentFormData.title !== '' ||
      currentFormData.date?.toDateString() !== new Date().toDateString() ||
      currentFormData.time !== '09:00' ||
      currentFormData.location !== '' ||
      currentFormData.type !== null ||
      currentFormData.hasEndDateTime !== false ||
      currentFormData.weekendGroupId !== null ||
      currentFormData.weekendId !== null

  const isFormValid = form.formState.isValid
  const isSaveDisabled =
    !isFormValid || (isEditing && !hasChanges) || isSubmitting

  return {
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
  }
}
