'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Address, emptyAddress } from '@/lib/users/validation'
import {
  BasicInfo,
  TeamInfoFormValues,
  TeamInfoSchema,
  UserExperienceFormValue,
} from './schemas'
import { updateUserAddress, updateUserBasicInfo } from '@/actions/users'
import { upsertUserExperience } from '@/actions/user-experience'
import { AddressSection } from './address-section'
import { BasicInfoSection } from './basic-info-section'
import { ExperienceSection } from './experience-section'
import { SkillsSection } from './skills-section'
import { isNil } from 'lodash'
import { completeInfoSheet } from '@/actions/team-forms'

interface TeamInfoFormProps {
  userId: string
  rosterId: string
  savedAddress: Address | null
  initialBasicInfo: BasicInfo
  initialServiceHistory: Array<UserExperienceFormValue>
}

export function TeamInfoForm({
  userId,
  rosterId,
  savedAddress,
  initialBasicInfo,
  initialServiceHistory,
}: TeamInfoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TeamInfoFormValues>({
    resolver: zodResolver(TeamInfoSchema),
    defaultValues: {
      address: savedAddress ?? emptyAddress,
      basicInfo: initialBasicInfo,
      experience: initialServiceHistory,
    },
  })

  const onSubmit = async (data: TeamInfoFormValues) => {
    setIsSubmitting(true)

    // Step 1: Update Address
    const addressResult = await updateUserAddress(userId, data.address)
    if (isErr(addressResult)) {
      toast.error(addressResult.error)
      setIsSubmitting(false)
      return
    }

    // Step 2: Update Basic Info
    const basicInfoResult = await updateUserBasicInfo(userId, data.basicInfo)
    if (isErr(basicInfoResult)) {
      toast.error(basicInfoResult.error)
      setIsSubmitting(false)
      return
    }

    // Step 3: Update Experience
    if (!isNil(data.experience)) {
      // We have to loop and upsert each.
      for (const item of data.experience) {
        // We only want to save items that are new (don't have an ID)
        if (isNil(item.id)) {
          const result = await upsertUserExperience(userId, item)
          if (isErr(result)) {
            console.error('Failed to upsert experience', item, result.error)
            toast.error(result.error)
            setIsSubmitting(false)
            return
          }
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
            <SkillsSection />

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
