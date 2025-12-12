'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isErr } from '@/lib/results'
import { Form } from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Address, addressSchema, emptyAddress } from '@/lib/users/validation'
import { updateUserAddress } from '@/actions/users'
import { AddressSection } from './address-section'

// Future: Import schemas for other sections
const teamInfoSchema = z.object({
  address: addressSchema,
  // placeholders for future steps
})

type TeamInfoFormValues = z.infer<typeof teamInfoSchema>

interface TeamInfoFormProps {
  userId: string
  savedAddress: Address | null
}

export function TeamInfoForm({ userId, savedAddress }: TeamInfoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TeamInfoFormValues>({
    resolver: zodResolver(teamInfoSchema),
    defaultValues: {
      address: savedAddress ??emptyAddress,
    },
  })

  const onSubmit = async (data: TeamInfoFormValues) => {
    setIsSubmitting(true)

    // Step 1: Update Address
    const addressResult = await updateUserAddress(userId, data.address)
    if (isErr(addressResult)) {
      toast.error(addressResult.error.message)
      setIsSubmitting(false)
      return
    }

    // Future: Save other sections (Team Info, Experience)

    toast.success('Address updated successfully!')
    // router.push('/') // Or wherever we go next. For now just toast.
    setIsSubmitting(false)
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h2">Team Information</Typography>
          </CardTitle>
          <CardDescription>
            <Typography variant="muted">
              Please complete your team member profile.
            </Typography>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AddressSection savedAddress={savedAddress} />

              {/* Future Sections: Church, Past Weekend, Experience, Skills */}

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Information'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
