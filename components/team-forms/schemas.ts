import { z } from 'zod'
import { CHARole } from '@/lib/weekend/types'

export const basicInfoSchema = z.object({
  church_affiliation: z.string().min(1, 'Church affiliation is required'),
  weekend_attended: z.object({
    community: z.string().min(1, 'Community is required'),
    number: z.string().min(1, 'Weekend number is required'),
    location: z.string().min(1, 'Location is required'),
  }),
  essentials_training_date: z.string().optional(),
})

export type BasicInfo = z.infer<typeof basicInfoSchema>

export const userExperienceSchema = z.object({
  id: z.string().optional(),
  cha_role: z.enum(CHARole, { message: 'Please select a role' }),
  community_weekend: z.string().min(1, 'Weekend is required'),
  date: z.string().min(1, 'Date is required'),
})

export type UserExperience = z.infer<typeof userExperienceSchema>
