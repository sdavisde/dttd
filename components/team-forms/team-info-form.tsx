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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Address, addressSchema, emptyAddress } from '@/lib/users/validation'
import { BasicInfo, basicInfoSchema, userExperienceSchema } from './schemas'
import { updateUserAddress, updateUserBasicInfo } from '@/actions/users'
import { upsertUserExperience } from '@/actions/user-experience'
import { AddressSection } from './address-section'
import { BasicInfoSection } from './basic-info-section'
import { ExperienceSection } from './experience-section'
import { isNil } from 'lodash'
import { completeInfoSheet } from '@/actions/team-forms'

// Future: Import schemas for other sections
const teamInfoSchema = z.object({
  address: addressSchema,
  basicInfo: basicInfoSchema,
  experience: z.array(userExperienceSchema).optional(),
})

type TeamInfoFormValues = z.infer<typeof teamInfoSchema>

interface TeamInfoFormProps {
  userId: string
  rosterId: string
  savedAddress: Address | null
  initialBasicInfo: BasicInfo
}

export function TeamInfoForm({
  userId,
  rosterId,
  savedAddress,
  initialBasicInfo,
}: TeamInfoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TeamInfoFormValues>({
    resolver: zodResolver(teamInfoSchema),
    defaultValues: {
      address: savedAddress ?? emptyAddress,
      basicInfo: initialBasicInfo,
      experience: [],
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

    // Step 2: Update Basic Info
    const basicInfoResult = await updateUserBasicInfo(userId, data.basicInfo)
    if (isErr(basicInfoResult)) {
      toast.error(basicInfoResult.error.message)
      setIsSubmitting(false)
      return
    }

    // Step 3: Update Experience
    if (!isNil(data.experience)) {
      // We have to loop and upsert each.
      for (const item of data.experience) {
        const result = await upsertUserExperience(userId, item)
        if (isErr(result)) {
          console.error('Failed to upsert experience', item, result.error)
          toast.error(result.error.message)
          setIsSubmitting(false)
          return
        }
      }
    }

    // Step 4: Update Info Sheet
    const infoSheetResult = await completeInfoSheet(rosterId)
    if (isErr(infoSheetResult)) {
      toast.error(infoSheetResult.error)
      setIsSubmitting(false)
      return
    }

    toast.success('Information saved successfully!')
    router.push('/')
    setIsSubmitting(false)
  }

  return (
    <>
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
            <BasicInfoSection />
            <ExperienceSection />

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Information'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
