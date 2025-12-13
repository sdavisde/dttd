import { CHARole } from '@/lib/weekend/types'
import { z } from 'zod'

export const UserExperienceSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  weekend_id: z.uuid().nullable(),
  cha_role: z.enum(CHARole, { error: 'Please select a role' }),
  weekend_reference: z.string(),
  rollo: z.string().nullable(),
  served_date: z.string().refine((value) => {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }, 'Invalid date'),
  created_at: z.string().transform((str) => {
    const date = new Date(str)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${str}`)
    }
    return date
  }),
  updated_at: z.string().transform((str) => {
    const date = new Date(str)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${str}`)
    }
    return date
  }),
})

/**
 * Represents experience a user has from a previous weekend
 */
export type UserExperience = z.infer<typeof UserExperienceSchema>
