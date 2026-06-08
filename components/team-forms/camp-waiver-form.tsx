'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { CampWaiverText } from '@/components/forms/camp-waiver-text'
import { signCampWaiver } from '@/actions/team-forms'

const campWaiverSchema = z.object({
  signature: z.string().min(2, 'Signature is required'),
})

type CampWaiverFormValues = z.infer<typeof campWaiverSchema>

interface CampWaiverFormProps {
  userName: string
  groupMemberId: string
}

export function CampWaiverForm({
  userName,
  groupMemberId,
}: CampWaiverFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CampWaiverFormValues>({
    resolver: zodResolver(campWaiverSchema),
    defaultValues: {
      signature: '',
    },
  })

  const currentDate = new Date().toLocaleDateString()

  const onSubmit = async (data: CampWaiverFormValues) => {
    setIsSubmitting(true)

    // TODO: Verify if a new column exists for this waiver.
    // Creating the action call assuming it will exist or user will add it.
    const result = await signCampWaiver(groupMemberId)

    if (isErr(result)) {
      toastError('Unable to save waiver form. Please try again.', {
        error: result.error,
      })
      setIsSubmitting(false)
      return
    }

    // Navigation to final step
    router.push('/team-forms/info-sheet')
    setIsSubmitting(false)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>
          <Typography variant="h2">WAIVER OF CLAIM</Typography>
          <Typography variant="h4" className="mt-2">
            TANGLEWOOD CHRISTIAN CAMP
          </Typography>
        </CardTitle>
        <CardDescription>
          <Typography variant="muted">
            Please read carefully and sign below.
          </Typography>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CampWaiverText />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/10 rounded-md items-end">
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="text-muted-foreground block"
                >
                  NAME OF ATTENDEE
                </Typography>
                <Typography variant="p" className="font-medium text-lg">
                  {userName}
                </Typography>
              </div>

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIGNATURE OF ATTENDEE</FormLabel>
                    <FormControl>
                      <Input placeholder="Sign with full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-2">
                <Typography
                  variant="small"
                  className="text-muted-foreground block mb-1"
                >
                  DATE
                </Typography>
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                  {currentDate}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/team-forms/release-of-claim')}
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Agree and Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
