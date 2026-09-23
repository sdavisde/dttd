import { z } from 'zod'
import { Permission } from '@/lib/security'

export const ROLE_DESCRIPTION_MIN_LENGTH = 10

/**
 * Shared between the Security editor (React Hook Form) and the server
 * actions, so both sides agree on what a valid role looks like.
 */
export const roleInputSchema = z.object({
  label: z.string().trim().min(1, 'Give the role a name.').max(80),
  description: z
    .string()
    .trim()
    .min(
      ROLE_DESCRIPTION_MIN_LENGTH,
      'Describe who this role is for, in plain language.'
    )
    .max(500),
  type: z.enum(['INDIVIDUAL', 'COMMITTEE']),
  based_on_role_id: z.string().uuid().nullable(),
  permissions: z.array(z.enum(Permission)),
})

export type RoleInputValues = z.infer<typeof roleInputSchema>
