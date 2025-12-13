'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { sendSponsorshipNotificationEmail } from '@/actions/emails'
import * as Results from '@/lib/results'
import { useSession } from '@/components/auth/session-provider'
import { createCandidateWithSponsorshipInfo } from '@/actions/candidates'
import { useWeekends } from '@/hooks/useWeekends'
import { Typography } from '@/components/ui/typography'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * This should match 1:1 with the candidate_sponsorship_info table
 */
const sponsorFormSchema = z.object({
  candidate_name: z.string().min(1, 'Candidate name is required'),
  candidate_email: z.string().email({ message: 'Invalid email address' }),
  weekend_id: z.string().min(1, 'Please select a weekend'),
  sponsor_name: z.string().min(1, 'Sponsor name is required'),
  sponsor_address: z.string().min(1, 'Address is required'),
  sponsor_email: z.string().optional(),
  sponsor_phone: z.string().min(1, 'Phone number is required'),
  sponsor_church: z.string().min(1, 'Church is required'),
  sponsor_weekend: z.string().min(1, 'Weekend information is required'),
  reunion_group: z.string().min(1, 'Reunion group information is required'),
  attends_secuela: z.string().min(1, 'Please select an option'),
  contact_frequency: z.string().min(1, 'Contact frequency is required'),
  church_environment: z
    .string()
    .min(1, 'Church environment description is required'),
  home_environment: z
    .string()
    .min(1, 'Home environment description is required'),
  social_environment: z
    .string()
    .min(1, 'Social environment description is required'),
  work_environment: z
    .string()
    .min(1, 'Work environment description is required'),
  god_evidence: z.string().min(1, "Evidence of God's leading is required"),
  support_plan: z.string().min(1, 'Support plan is required'),
  prayer_request: z.string(),
  payment_owner: z.string().min(1, 'Payment owner is required'),
})

export type SponsorFormSchema = z.infer<typeof sponsorFormSchema>

export function SponsorForm() {
  const router = useRouter()
  const { user } = useSession()
  const {
    data: weekends,
    isLoading: isLoadingWeekends,
    error: weekendsError,
  } = useWeekends()

  const form = useForm<SponsorFormSchema>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      candidate_name: '',
      candidate_email: '',
      weekend_id: '',
      sponsor_name: '',
      sponsor_address: '',
      sponsor_email: '',
      sponsor_phone: '',
      sponsor_church: '',
      sponsor_weekend: '',
      reunion_group: '',
      attends_secuela: '',
      contact_frequency: '',
      church_environment: '',
      home_environment: '',
      social_environment: '',
      work_environment: '',
      god_evidence: '',
      support_plan: '',
      prayer_request: '',
      payment_owner: '',
    },
  })

  const onSubmit = async (data: SponsorFormSchema) => {
    try {
      logger.info(`Submitting sponsor form: ${JSON.stringify(data)}`)

      if (!user?.email) {
        throw new Error('Current user email not found')
      }

      const sponsorshipFormData = {
        ...data,
        sponsor_email: user?.email,
      }

      // Create candidate with sponsorship info using the new schema
      const candidateResult =
        await createCandidateWithSponsorshipInfo(sponsorshipFormData)

      if (Results.isErr(candidateResult)) {
        throw new Error(candidateResult.error)
      }

      // Send notification email to preweekend couple
      await sendSponsorshipNotificationEmail(candidateResult.data.id)

      logger.info(
        `Candidate created successfully: ${JSON.stringify(candidateResult.data)}`
      )

      router.push(`/sponsor/submitted?id=${candidateResult.data.id}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      form.setError('root', { message: errorMessage })
      logger.error(`Error submitting form: ${JSON.stringify(error)}`)
    }
  }

  // Check if there are any form validation errors
  const hasFormErrors = Object.keys(form.formState.errors).length > 0

  return (
    <div className="container mx-auto p-4">
      <Card className="border-0 md:border-[1px] shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle>
            <Typography variant="h1">Sponsor a Candidate</Typography>
          </CardTitle>
          <CardDescription>
            <Typography variant="muted">
              Please fill out the following information to sponsor a candidate.
            </Typography>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          {weekendsError instanceof Error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Weekends</AlertTitle>
              <AlertDescription>
                Failed to load available weekends. Please refresh the page and
                try again.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2">
                <Typography variant="h6">Basic Information</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="candidate_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="candidate_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Candidate Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weekend_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekend</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-full w-full">
                              <SelectValue
                                placeholder={
                                  isLoadingWeekends
                                    ? 'Loading weekends...'
                                    : 'Select a weekend'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {weekends?.MENS && (
                              <SelectItem value={weekends.MENS.id}>
                                Men&apos;s Weekend -{' '}
                                {weekends.MENS.title ||
                                  `Weekend #${weekends.MENS.number}`}
                              </SelectItem>
                            )}
                            {weekends?.WOMENS && (
                              <SelectItem value={weekends.WOMENS.id}>
                                Women&apos;s Weekend -{' '}
                                {weekends.WOMENS.title ||
                                  `Weekend #${weekends.WOMENS.number}`}
                              </SelectItem>
                            )}
                            {!weekends?.MENS &&
                              !weekends?.WOMENS &&
                              !isLoadingWeekends && (
                                <SelectItem value="" disabled>
                                  No active weekends available
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sponsor Information */}
                <Typography variant="h6" className="mt-4">
                  Sponsor Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="sponsor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor&apos;s Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sponsor_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor&apos;s Phone #</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sponsor_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor&apos;s Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sponsor_church"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor&apos;s Church</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sponsor_weekend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Sponsor&apos;s Weekend Attended & Where
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reunion_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Sponsor&apos;s Reunion Group Name & Location
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attends_secuela"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you attend Secuela regularly?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col"
                          >
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          How often do you have contact with candidate?
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Typography variant="h6" className="mt-4">
                  Describe the environment (situations) of EACH below regarding
                  the candidate:
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="church_environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="home_environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Environment</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="work_environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="god_evidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          What evidence have you seen that God is leading the
                          candidate to this weekend?
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="support_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          How do you intend to support the candidate before,
                          during and after the weekend (4th Day)?
                        </FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prayer_request"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Has the candidate asked you to submit a specific
                          prayer request on his/her behalf?
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who is paying for the candidate?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col"
                          >
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <RadioGroupItem value="sponsor" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Sponsor
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center gap-3">
                              <FormControl>
                                <RadioGroupItem value="candidate" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Candidate
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error Display */}
                {hasFormErrors && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Error Submitting Form</AlertTitle>
                    <AlertDescription>
                      {Object.entries(form.formState.errors).map(
                        ([key, value]) => (
                          <Typography key={key} variant="small">
                            {value.message}
                          </Typography>
                        )
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? 'Submitting...'
                    : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
