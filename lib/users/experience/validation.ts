import { CHARole } from '@/lib/weekend/types'
import { z } from 'zod'

export const UserExperienceSchema = z
  .object({
    id: z.uuid(),
    user_id: z.uuid(),
    weekend_id: z.uuid().nullable(),
    cha_role: z.enum(CHARole),
    external_community_weekend: z.string().nullable(),
    rollo: z.string().nullable(),
    served_date: z.string().transform((str) => {
      const date = new Date(str)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${str}`)
      }
      return date
    }),
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
  .refine(
    (data) => data.weekend_id !== null || data.external_community_weekend !== null,
    {
      message:
        'Either weekend_id or external_community_weekend must be provided',
      path: ['weekend_id'],
    }
  )
  .refine(
    (data) => !(data.weekend_id !== null && data.external_community_weekend !== null),
    {
      message: 'Cannot have both weekend_id and external_community_weekend',
      path: ['weekend_id'],
    }
  )

export type UserExperience = z.infer<typeof UserExperienceSchema>
