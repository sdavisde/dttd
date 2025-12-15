'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { isErr } from '@/lib/results'
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
import { signCampWaiver } from '@/actions/team-forms'

const campWaiverSchema = z.object({
  signature: z.string().min(2, 'Signature is required'),
})

type CampWaiverFormValues = z.infer<typeof campWaiverSchema>

interface CampWaiverFormProps {
  userName: string
  rosterId: string
}

export function CampWaiverForm({ userName, rosterId }: CampWaiverFormProps) {
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
    const result = await signCampWaiver(rosterId)

    if (isErr(result)) {
      toast.error(result.error)
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
        <div className="bg-muted/30 p-6 rounded-lg border space-y-4 text-sm">
          <Typography variant="p">
            This Waiver of Claim (the “Waiver”) is given for the following
            purposes:
          </Typography>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <Typography variant="p">
                I hereby desire to participate in various activities while on or
                about the premises of Tanglewood Christian Camp in Tanglewood,
                TX without any supervision supplied by Tanglewood Christian
                Camp.
              </Typography>
            </li>
            <li>
              <Typography variant="p">
                I recognize that although the odds of serious injury or death is
                low, nevertheless, a body that slips or falls may have a
                reaction to the immediate injury or the treatment for such
                injury that results in a medical condition that could lead to
                serious injury or death.
              </Typography>
            </li>
            <li>
              <Typography variant="p">
                I agree that in exchange for Tanglewood Christian Camp allowing
                me to participate in the activities on the premises that I in my
                individual capacities will not assert or pursue a claim for
                personal injury against Tanglewood Christian Camp or any person
                or entity or fellow participant that conducts or participates in
                any activity on the premises. More specifically, I hereby WAIVE
                and RENOUNCE and RELEASE any claim for personal injury suffered
                by me during activities regardless of the cause of the injury,
                that is, regardless of whether the injury is caused by
                participating in the/a planned activity or injury caused by
                movement on the premises or the mere going to and from the site
                where the activity takes place and regardless of whether the
                injury is caused by the negligence of any person or entity
                involved in the activity or the condition of the premises where
                the activity takes place SAVE and EXCEPT injury caused by gross
                negligence of Tanglewood Christian Camp acting through its
                agents, servants, employees, officers, directors or owners.
              </Typography>
            </li>
            <li>
              <Typography variant="p">
                I agree that if any claim is brought by any participant against
                Tanglewood Christian Camp or any employee, agent, owner,
                director or officer of Tanglewood Christian Camp because of my
                actions or omissions while participating in activities on the
                premises of Tanglewood Christian Camp, I shall INDEMNIFY and
                HOLD HARMLESS Tanglewood Christian Camp, its employees, agents,
                owners, officers and directors from and against any such claim
                including the duty to investigate, defend and pay on the part of
                Tanglewood Christian Camp.
              </Typography>
            </li>
            <li>
              <Typography variant="p">
                Texas law governs the interpretation and enforcement of this
                Waiver. Venue of any dispute will be in the county where
                Tanglewood Christian Camp is located. Any claim shall be first
                discussed among the claimant(s) and Tanglewood Christian Camp
                before any suit if filed by way of face-to-face meeting on the
                premises, and thereafter, by way of non-binding mediation BEFORE
                suit to interpret or enforce is filed.
              </Typography>
            </li>
          </ol>
        </div>

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
