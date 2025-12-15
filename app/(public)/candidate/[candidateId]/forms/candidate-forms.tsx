'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { WaiverDialog } from '@/components/ui/waiver-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { addCandidateInfo } from '@/actions/candidates'
import { isErr } from '@/lib/results'
import { calculateAge } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  /** Personal Info */
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  shirtSize: z.string().min(1, 'Shirt size is required'),
  maritalStatus: z
    .enum(['single', 'married', 'widowed', 'divorced', 'separated'])
    .optional(),
  /** Make these fields conditionally render only if maritalStatus is married */
  hasSpouseAttendedWeekend: z.boolean().optional(),
  spouseWeekendLocation: z.string().optional(),
  spouseName: z.string().optional(),
  hasFriendsAttendingWeekend: z.boolean().optional(),
  isChristian: z.boolean().optional(),
  church: z.string().optional(),
  memberOfClergy: z.boolean().optional(),
  reasonForAttending: z.string().optional(),
  /** Address*/
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(1, 'Phone number is required'),
  /** Health section */
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(1, 'Emergency contact phone is required'),
  medicalConditions: z.string().optional(),
  medicalPermission: z.boolean(),
  emergencyContactPermission: z.boolean(),
})
type FormValues = z.infer<typeof formSchema>

type CandidateFormsProps = {
  candidateId: string
}

export function CandidateForms({ candidateId }: CandidateFormsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waiverOpen, setWaiverOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const form = useForm<FormValues>({
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      shirtSize: '',
      maritalStatus: undefined,
      hasSpouseAttendedWeekend: false,
      spouseWeekendLocation: '',
      spouseName: '',
      hasFriendsAttendingWeekend: false,
      isChristian: false,
      church: '',
      memberOfClergy: false,
      reasonForAttending: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalConditions: '',
      medicalPermission: false,
      emergencyContactPermission: false,
    },
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      console.log('Form data:', data)

      // Calculate age from date of birth
      const age = calculateAge(data.dateOfBirth)

      const result = await addCandidateInfo(candidateId, {
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        date_of_birth: data.dateOfBirth,
        shirt_size: data.shirtSize,
        marital_status: data.maritalStatus ?? null,
        has_spouse_attended_weekend: data.hasSpouseAttendedWeekend ?? null,
        spouse_weekend_location: data.spouseWeekendLocation ?? null,
        spouse_name: data.spouseName ?? null,
        has_friends_attending_weekend: data.hasFriendsAttendingWeekend ?? null,
        is_christian: data.isChristian ?? null,
        church: data.church ?? null,
        member_of_clergy: data.memberOfClergy ?? null,
        reason_for_attending: data.reasonForAttending ?? null,
        emergency_contact_name: data.emergencyContactName ?? null,
        emergency_contact_phone: data.emergencyContactPhone ?? null,
        medical_conditions: data.medicalConditions ?? null,
        age,
      })
      if (isErr(result)) {
        form.setError('root', { message: result.error })
        return
      }

      router.push(`/candidate/${candidateId}/forms/success`)
    } catch (error) {
      form.setError('root', {
        message: 'An error occurred while submitting the form',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(date) =>
                          field.onChange(date?.toISOString())
                        }
                        className="w-full"
                        startMonth={new Date(new Date().getFullYear() - 100, 0)}
                        endMonth={new Date(new Date().getFullYear() - 18, 11)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shirtSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shirt Size</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select shirt size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="XS">XS</SelectItem>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                        <SelectItem value="XXXL">XXXL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional spouse fields */}
              {form.watch('maritalStatus') === 'married' && (
                <>
                  <FormField
                    control={form.control}
                    name="hasSpouseAttendedWeekend"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Has your spouse attended a Tres Dias weekend?
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasSpouseAttendedWeekend"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="hasSpouseAttendedWeekend">
                              Yes
                            </Label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spouseWeekendLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          If spouse has already attended a Tres Dias, please
                          state below which community/location they attended.
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
                    name="spouseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          If spouse has submitted an application for next
                          weekend, please print their name below:
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="hasFriendsAttendingWeekend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Do you have any friends or relatives that will also be
                      attending this weekend?
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasFriendsAttendingWeekend"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="hasFriendsAttendingWeekend">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isChristian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you a Christian?</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isChristian"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="isChristian">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="church"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Church Attending</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberOfClergy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Are you a member of the Clergy or Ordained?
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="memberOfClergy"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="memberOfClergy">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reasonForAttending"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      What is your heartfelt reasoning for wanting to attend
                      this Dusty Trails Tres Dias weekend?
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact & Health Section */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact & Health Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Any medical conditions that you would like us to be aware
                      of, please let us know
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormDescription>
                      Example: food allergies, medications at certain times
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {successMessage && (
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {Object.values(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {Object.values(form.formState.errors)
                .map((error) => error.message)
                .join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>

      <WaiverDialog
        open={waiverOpen}
        onOpenChange={setWaiverOpen}
        title="Tanglewood Christian Camp Waiver"
        content={`
WAIVER OF CLAIM TANGLEWOOD CHRISTIAN CAMP

This Waiver of Claim (the "Waiver") is given for the following purposes:

1. I hereby desire to participate in various activities while on or about the premises Of Tanglewood Christian Camp in Tanglewood. TX without any supervision supplied by Tanglewood Christian Camp.
2. I recognize that although the odds of serious injury or death is low, nevertheless, a body that slips-or falls may have a reaction to the immediate injury or the treatment for such injury that results in a medical condition that could lead to serious injury or death.
3. I agree that in exchange for Tanglewood Christian Camp allowing me to participate in the activities on the premises that Im aware my individual capacities will not assert or pursue a claim for personal injury against Tanglewood Christian Camp or any person or entity or fellow participant that conducts or participates in any activity on the premises. More specifically, I hereby WAIVE and RENOUNCE and RELEASE any claim for personal injury suffered by me during activities regardless of the cause of the injury, that is, regardless of whether the injury is caused by participating in the/a planned activity or injury caused by movement on the premises or the mere going to and from the site where the activity takes place and regardless of whether the injury is caused by the negligence of any person or entity involved in the activity or the condition of the premises where the activity takes place SAVE and EXCEPT injury caused by gross negligence of Tanglewood Christian Camp acting through its agents, servants, employees, officers, directors or owners.
4. I agree that if any claim is brought by any participant against Tanglewood Christian Camp or any employee, agent, owner, director or officer of Tanglewood Christian Camp because of my actions or omissions while participating in activities on the premises of Tanglewood Christian Camp, I shall INDEMNIFY and HOLD HARMLESS Tanglewood Christian Camp, its employees, agents, owners, officers and directors from and against any such claim including the duty to investigate, defend and pay on the part of Tanglewood Christian Camp.
5. Texas law governs the interpretation and enforcement of this Waiver. Venue of any dispute will be ni the county where Tanglewood Christian Camp is located. Any claim shall be first discussed among the claimants) and Tanglewood Christian Camp before any suit if filed by way of face-to-face meeting on the premises, and thereafter, by way of non-binding mediation BEFORE suit to interpret or enforce is filed
        `}
        onAcknowledge={() => setWaiverOpen(false)}
        acknowledgeText="I have read, understood, and agree to the medical permission terms"
      />
    </Form>
  )
}
