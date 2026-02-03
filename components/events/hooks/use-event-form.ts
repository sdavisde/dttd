'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { type Event } from '@/services/events'
import { createEvent, updateEvent, deleteEvent } from '@/services/events'
import { type EventTypeValue } from '@/services/events/types'
import { isErr } from '@/lib/results'
import {
  eventFormSchema,
  EventFormData,
  DEFAULT_FORM_VALUES,
  CT_TIMEZONE,
} from '../event-form-schema'

interface UseEventFormProps {
  event?: Event | null
  onClose: () => void
}

export function useEventForm({ event, onClose }: UseEventFormProps) {
  const isEditing = !!event
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
    if (isEditing && event) {
      const resetData: Partial<EventFormData> = {
        title: event.title ?? '',
        time: '09:00',
        location: event.location ?? '',
        type: event.type ?? null,
        hasEndDateTime: !!event.endDatetime,
        endDate: null,
        endTime: null,
        weekendId: event.weekendId ?? null,
      }

      if (event.datetime) {
        const utcDate = new Date(event.datetime)
        const ctDate = toZonedTime(utcDate, CT_TIMEZONE)
        resetData.date = ctDate
        resetData.time = format(ctDate, 'HH:mm')
      }

      if (event.endDatetime) {
        const utcEndDate = new Date(event.endDatetime)
        const ctEndDate = toZonedTime(utcEndDate, CT_TIMEZONE)
        resetData.endDate = ctEndDate
        resetData.endTime = format(ctEndDate, 'HH:mm')
      }

      const formData = resetData as EventFormData
      form.reset(formData)
      setOriginalFormData(formData)
    } else {
      form.reset(DEFAULT_FORM_VALUES)
      setOriginalFormData(null)
    }
  }, [isEditing, event, form])

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      const [hours, minutes] = data.time.split(':').map(Number)
      const ctDateTime = new Date(data.date)
      ctDateTime.setHours(hours, minutes, 0, 0)
      const utcDateTime = fromZonedTime(ctDateTime, CT_TIMEZONE)

      let endDatetimeUtc: string | null = null
      if (data.hasEndDateTime && data.endDate && data.endTime) {
        const [endHours, endMinutes] = data.endTime.split(':').map(Number)
        const ctEndDateTime = new Date(data.endDate)
        ctEndDateTime.setHours(endHours, endMinutes, 0, 0)
        endDatetimeUtc = fromZonedTime(ctEndDateTime, CT_TIMEZONE).toISOString()
      }

      const eventData = {
        title: data.title,
        datetime: utcDateTime.toISOString(),
        location: data.location ?? null,
        type: (data.type as EventTypeValue) ?? null,
        end_datetime: endDatetimeUtc,
        weekend_id: data.weekendId ?? null,
      }

      if (isEditing && event) {
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
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
      console.error('Error saving event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
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
    form.reset(DEFAULT_FORM_VALUES)
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
        type: currentFormData.type,
        hasEndDateTime: currentFormData.hasEndDateTime,
        endDate: currentFormData.endDate?.toISOString(),
        endTime: currentFormData.endTime,
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
        weekendId: originalFormData.weekendId,
      })
    : currentFormData.title !== '' ||
      currentFormData.date?.toDateString() !== new Date().toDateString() ||
      currentFormData.time !== '09:00' ||
      currentFormData.location !== '' ||
      currentFormData.type !== null ||
      currentFormData.hasEndDateTime !== false ||
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
