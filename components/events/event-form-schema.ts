import { z } from 'zod'

export const CT_TIMEZONE = 'America/Chicago'

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Event name is required'),
  date: z.date({ error: 'Date is required' }),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().nullable().optional(),
  hasEndDateTime: z.boolean(),
  endDate: z.date().nullable().optional(),
  endTime: z.string().nullable().optional(),
  weekendId: z.string().nullable().optional(),
})

export type EventFormData = z.infer<typeof eventFormSchema>

export interface WeekendOption {
  id: string
  label: string
}

export const DEFAULT_FORM_VALUES: EventFormData = {
  title: '',
  date: new Date(),
  time: '09:00',
  location: '',
  type: null,
  hasEndDateTime: false,
  endDate: null,
  endTime: null,
  weekendId: null,
}
