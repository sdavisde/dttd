'use client'

import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EVENT_TYPE_VALUES, EVENT_TYPE_LABELS } from '@/services/events/types'
import { EventFormData, WeekendOption } from './event-form-schema'

interface EventFormFieldsProps {
  form: UseFormReturn<EventFormData>
  hasEndDateTime: boolean
  weekendOptions: WeekendOption[]
}

export function EventFormFields({
  form,
  hasEndDateTime,
  weekendOptions,
}: EventFormFieldsProps) {
  return (
    <div className="space-y-4 px-4 flex-1">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Event Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Team Meeting 1" {...field} required />
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
            <FormLabel className="text-sm font-medium">Date *</FormLabel>
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
            <FormLabel className="text-sm font-medium">Time (CT) *</FormLabel>
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
            <FormLabel className="text-sm font-medium">Location *</FormLabel>
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

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Event Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EVENT_TYPE_VALUES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {weekendOptions.length > 0 && (
        <FormField
          control={form.control}
          name="weekendId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Associated Weekend
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a weekend (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {weekendOptions.map((weekend) => (
                    <SelectItem key={weekend.id} value={weekend.id}>
                      {weekend.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="hasEndDateTime"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Add end date/time</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {hasEndDateTime && (
        <>
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">End Date</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value ?? undefined}
                    onDateChange={field.onChange}
                    placeholder="Select end date"
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
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  End Time (CT)
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    step="900"
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  )
}
