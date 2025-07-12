'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box } from '@mui/material'

const formSchema = z.object({
  _: z.boolean().optional(),
  /** Address & Personal Info*/
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  phone: z.string().min(1),
  dateOfBirth: z.string().min(1),
  age: z.number().min(1),
  shirtSize: z.string().min(1),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced', 'separated']).optional(),
  /** Make these fields conditionally render only if maritalStatus is married */
  hasSpouseAttendedWeekend: z.boolean().optional(),
  spouseWeekendLocation: z.string().optional(),
  spouseName: z.string().optional(),
  /** Health section */
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
  coveredByInsurance: z.boolean(),
  /** If covered by insurance, show this field */
  insuranceInformation: z.string().min(1),
  allergies: z.string().optional(),
  allergyManagement: z.string().optional(),
  hasMedication: z.boolean(),
  medicationInformation: z.string().optional(),
  //todo:  restrictions (Z) : not sure what this field is for
  activityRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  familyPhysician: z.string().min(1),
  physicianPhone: z.string().min(1),
  familyDentist: z.string().min(1),
  dentistPhone: z.string().min(1),
  /** Smoking section */
  smokeOrVape: z.boolean().optional(),
  acknowledgedSmokeRules: z.boolean(),
  requireSpecialAssistance: z.boolean(),
  /** Church section */
  church: z.string().min(1),
})
type FormValues = z.infer<typeof formSchema>

export function CandidateForms() {
  const form = useForm<FormValues>({
    defaultValues: {
      _: true,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      dateOfBirth: '',
      age: 0,
      shirtSize: '',
      maritalStatus: undefined,
      hasSpouseAttendedWeekend: false,
      spouseWeekendLocation: '',
      spouseName: '',
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
      requireSpecialAssistance: false,
      church: '',
    },
    resolver: zodResolver(formSchema),
  })

  return (
    <Box>
      {/* Implement form fields to match schema */}
      {/* Address Section */}
    </Box>
  )
}
