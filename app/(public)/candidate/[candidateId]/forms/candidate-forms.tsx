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
  requireSpecialAssistance: z.boolean(),
  specialNeeds: z.string().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(1, 'Emergency contact phone is required'),
  coveredByInsurance: z.boolean().optional(),
  /** If covered by insurance, show this field */
  insuranceInformation: z.string().optional(),
  allergies: z.string().optional(),
  allergyManagement: z.string().optional(),
  hasMedication: z.boolean(),
  medicationInformation: z.string().optional(),
  activityRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  familyPhysician: z.string().min(1, 'Family physician is required'),
  physicianPhone: z.string().min(1, 'Physician phone is required'),
  familyDentist: z.string().min(1, 'Family dentist is required'),
  dentistPhone: z.string().min(1, 'Dentist phone is required'),
  /** Smoking section */
  smokeOrVape: z.boolean().optional(),
  acknowledgedSmokeRules: z.boolean(),
  acknowledgedCampRules: z.boolean(),
  /** Medical permissions */
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
      requireSpecialAssistance: false,
      specialNeeds: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      coveredByInsurance: false,
      insuranceInformation: '',
      allergies: '',
      allergyManagement: '',
      hasMedication: false,
      medicationInformation: '',
      activityRestrictions: '',
      medicalConditions: '',
      familyPhysician: '',
      physicianPhone: '',
      familyDentist: '',
      dentistPhone: '',
      smokeOrVape: false,
      acknowledgedSmokeRules: false,
      acknowledgedCampRules: false,
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
        require_special_assistance: data.requireSpecialAssistance ?? null,
        special_needs: data.specialNeeds ?? null,
        emergency_contact_name: data.emergencyContactName ?? null,
        emergency_contact_phone: data.emergencyContactPhone ?? null,
        covered_by_insurance: data.coveredByInsurance ?? null,
        insurance_information: data.insuranceInformation ?? null,
        allergies: data.allergies ?? null,
        allergy_management: data.allergyManagement ?? null,
        has_medication: data.hasMedication ?? null,
        medication_information: data.medicationInformation ?? null,
        activity_restrictions: data.activityRestrictions ?? null,
        medical_conditions: data.medicalConditions ?? null,
        family_physician: data.familyPhysician ?? null,
        physician_phone: data.physicianPhone ?? null,
        family_dentist: data.familyDentist ?? null,
        dentist_phone: data.dentistPhone ?? null,
        smoke_or_vape: data.smokeOrVape ?? null,
        acknowledged_smoke_rules: data.acknowledgedSmokeRules ?? null,
        acknowledged_camp_rules: data.acknowledgedCampRules ?? null,
        medical_permission: data.medicalPermission ?? null,
        emergency_contact_permission: data.emergencyContactPermission ?? null,
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
                name="requireSpecialAssistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Do you have ANY Special Needs/Assistance? (ex: Sleep
                      Apnea, Diabetes, Walking Assistance, etc)
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requireSpecialAssistance"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="requireSpecialAssistance">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('requireSpecialAssistance') && (
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please state your needs below</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start mt-4">
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
                name="coveredByInsurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you covered by insurance?</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="coveredByInsurance"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="coveredByInsurance">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('coveredByInsurance') && (
                <FormField
                  control={form.control}
                  name="insuranceInformation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Please provide the following Insurance Information
                        below: Insurance Name / Policy #/ Group # / Subscriber
                        Name/ Relationship to participant
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any Food/Other Allergies?</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergyManagement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Describe (Allergy) Reaction and Management of Reaction
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasMedication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you take any medications?</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasMedication"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="hasMedication">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('hasMedication') && (
                <FormField
                  control={form.control}
                  name="medicationInformation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        List ALL Medications below & Reason for taking (ex:
                        Lexapro - Depression/Anxiety)
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="activityRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please list ANY restrictions that apply to activity
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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
                      Do you have ANY Medical Conditions that staff should know?
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="familyPhysician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Family Physician</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="physicianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physician Phone Number & Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="familyDentist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Family Dentist</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dentistPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dentist Phone Number & Address Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smokeOrVape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you smoke or vape?</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="smokeOrVape"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="smokeOrVape">Yes</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acknowledgedSmokeRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      If you marked &quot;YES&quot; for smoking, please be aware
                      there are only 2-3 breaks per day (in a specific area
                      &quot;designated for smoking&quot; on camp):
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acknowledgedSmokeRules"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="acknowledgedSmokeRules">
                          I acknowledge
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Smoking & Special Assistance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Acknowledgements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="acknowledgedCampRules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      I acknowledge the camp rules and policies
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="acknowledgedCampRules"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="acknowledgedCampRules">
                          I acknowledge
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalPermission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      I hereby give permission to the medical personnel selected
                      by the camp staff to order X-rays, routine tests,
                      treatment; to release any records necessary for insurance
                      purposes; and to provide or arrange necessary related
                      transportation for me. I further, hereby give permission
                      to the physician selected by the camp staff to secure and
                      administer treatment, including hospitalization,
                      anesthesia, surgery, or any other medical decision.{' '}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="medicalPermission"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="medicalPermission">
                            I have read, acknowledged and agree to give
                            permission to selected personnel for medical
                            purposes
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setWaiverOpen(true)}
                        >
                          Read Tanglewood Christian Camp Waiver
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPermission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      I acknowledge that the Dusty Trails Tres Dias nurse will
                      attempt to contact the emergency contact listed at the top
                      of this waiver as soon as possible and will keep them
                      up-to-date concerning the condition and treatment of the
                      Attendee
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emergencyContactPermission"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="emergencyContactPermission">
                          I acknowledge
                        </Label>
                      </div>
                    </FormControl>
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
