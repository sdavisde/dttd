'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events'
import { type Event } from '@/actions/events'
import { logger } from '@/lib/logger'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface EventSidebarProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export function EventSidebar({ event, isOpen, onClose }: EventSidebarProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: undefined as Date | undefined,
    time: '',
    location: '',
  })
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()

  // Simple conversion from UTC datetime to date/time components
  const parseDateTime = (utcDatetime: string | null) => {
    if (!utcDatetime) return { date: undefined, time: '' }

    try {
      const date = new Date(utcDatetime)
      const timeString = date.toTimeString().slice(0, 8) // HH:mm:ss format
      return { date, time: timeString }
    } catch {
      return { date: undefined, time: '' }
    }
  }

  // Simple conversion from date/time components to ISO string
  const combineDateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return null

    try {
      const [hour, minute, second = '00'] = time.split(':')
      const combinedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      )
      return combinedDate.toISOString()
    } catch {
      return null
    }
  }

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      const { date, time } = parseDateTime(event.datetime)
      setFormData({
        title: event.title || '',
        date,
        time,
        location: event.location || '',
      })
    } else {
      setFormData({
        title: '',
        date: undefined,
        time: '',
        location: '',
      })
    }
  }, [event])

  // Reset mutations when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      createEvent.reset()
      updateEvent.reset()
    }
  }, [isOpen, createEvent, updateEvent])

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    console.log('handleInputChange:', field, value)
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      console.log('New form data:', newData)
      return newData
    })
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return

    try {
      const eventData = {
        title: formData.title.trim(),
        datetime: combineDateTime(formData.date, formData.time),
        location: formData.location.trim() || null,
      }

      if (event) {
        // Update existing event
        await updateEvent.mutateAsync({
          id: event.id,
          data: eventData
        })
      } else {
        // Create new event
        await createEvent.mutateAsync(eventData)
      }
      onClose()
    } catch (e) {
      logger.error('Failed to save event:', e)
    }
  }

  // Check if form has changes
  const hasChanges = event
    ? (() => {
      const originalDateTime = parseDateTime(event.datetime)
      return formData.title !== (event.title || '') ||
        formData.date?.getTime() !== originalDateTime.date?.getTime() ||
        formData.time !== originalDateTime.time ||
        formData.location !== (event.location || '')
    })()
    : formData.title.trim() !== '' || formData.date !== undefined || formData.time !== '' || formData.location.trim() !== ''

  const isLoading = createEvent.isPending || updateEvent.isPending
  const error = createEvent.error || updateEvent.error

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 p-4">
          {error != null && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to save event'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Event Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title..."
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-3 flex-1">
              <Label htmlFor="date-picker" className="px-1">
                Date
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between font-normal"
                    disabled={isLoading}
                  >
                    {formData.date ? formData.date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      console.log('Calendar selected:', date)
                      if (date) {
                        handleInputChange('date', date)
                        setDatePickerOpen(false)
                      }
                    }}
                    disabled={isLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <Label htmlFor="time-picker" className="px-1">
                Time
              </Label>
              <Input
                type="time"
                id="time-picker"
                step="1"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                disabled={isLoading}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Textarea
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter event location..."
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !formData.title.trim() ||
              isLoading ||
              !hasChanges
            }
          >
            {isLoading
              ? 'Saving...'
              : event
                ? 'Save Changes'
                : 'Create Event'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}