import { z } from 'zod'

export const addressSchema = z.object({
    addressLine1: z.string().min(1, 'Street address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().min(5, 'Zip code is required'),
})

export type Address = z.infer<typeof addressSchema>
