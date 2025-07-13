'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Grid,
  Button,
  FormHelperText,
} from '@mui/material'
import { useState } from 'react'
import { YesNoField } from '@/components/form/YesNoField'

const formSchema = z.object({
  _: z.boolean().optional(),
  /** Personal Info */
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(1, 'Age is required'),
  shirtSize: z.string().min(1, 'Shirt size is required'),
  maritalStatus: z.enum(['single', 'married', 'widowed', 'divorced', 'separated']).optional(),
  /** Make these fields conditionally render only if maritalStatus is married */
  hasSpouseAttendedWeekend: z.boolean().optional(),
  spouseWeekendLocation: z.string().optional(),
  spouseName: z.string().optional(),
  /** Address*/
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: z.string().min(1, 'Phone number is required'),
  /** Health section */
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  coveredByInsurance: z.boolean(),
  /** If covered by insurance, show this field */
  insuranceInformation: z.string().min(1, 'Insurance information is required'),
  allergies: z.string().optional(),
  allergyManagement: z.string().optional(),
  hasMedication: z.boolean(),
  medicationInformation: z.string().optional(),
  //todo:  restrictions (Z) : not sure what this field is for
  activityRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  familyPhysician: z.string().min(1, 'Family physician is required'),
  physicianPhone: z.string().min(1, 'Physician phone is required'),
  familyDentist: z.string().min(1, 'Family dentist is required'),
  dentistPhone: z.string().min(1, 'Dentist phone is required'),
  /** Smoking section */
  smokeOrVape: z.boolean().optional(),
  acknowledgedSmokeRules: z.boolean(),
  requireSpecialAssistance: z.boolean(),
  /** Church section */
  church: z.string().min(1, 'Church is required'),
})
type FormValues = z.infer<typeof formSchema>

export function CandidateForms() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      _: true,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      firstName: '',
      lastName: '',
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

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const maritalStatus = watch('maritalStatus')
  const coveredByInsurance = watch('coveredByInsurance')
  const hasMedication = watch('hasMedication')

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      console.log('Form data:', data)
      // TODO: Implement form submission logic
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
    >
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h6'
          gutterBottom
        >
          Personal Information
        </Typography>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <Grid>
            <Controller
              name='firstName'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='First Name'
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='lastName'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Last Name'
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='church'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Church Name'
                  fullWidth
                  error={!!errors.church}
                  helperText={errors.church?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='shirtSize'
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.shirtSize}
                >
                  <InputLabel>Shirt Size</InputLabel>
                  <Select
                    {...field}
                    label='Shirt Size'
                  >
                    <MenuItem value='XS'>XS</MenuItem>
                    <MenuItem value='S'>S</MenuItem>
                    <MenuItem value='M'>M</MenuItem>
                    <MenuItem value='L'>L</MenuItem>
                    <MenuItem value='XL'>XL</MenuItem>
                    <MenuItem value='XXL'>XXL</MenuItem>
                    <MenuItem value='XXXL'>XXXL</MenuItem>
                  </Select>
                  {errors.shirtSize && <FormHelperText>{errors.shirtSize.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='maritalStatus'
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.maritalStatus}
                >
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    {...field}
                    label='Marital Status'
                  >
                    <MenuItem value='single'>Single</MenuItem>
                    <MenuItem value='married'>Married</MenuItem>
                    <MenuItem value='widowed'>Widowed</MenuItem>
                    <MenuItem value='divorced'>Divorced</MenuItem>
                    <MenuItem value='separated'>Separated</MenuItem>
                  </Select>
                  {errors.maritalStatus && <FormHelperText>{errors.maritalStatus.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          {/* Conditional spouse fields */}
          {maritalStatus === 'married' && (
            <>
              <Grid>
                <Controller
                  name='spouseName'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Spouse Name'
                      fullWidth
                      error={!!errors.spouseName}
                      helperText={errors.spouseName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid>
                <YesNoField
                  name='hasSpouseAttendedWeekend'
                  control={control}
                  label='Has your spouse attended a Tres Dias weekend?'
                  error={errors.hasSpouseAttendedWeekend?.message}
                />
              </Grid>

              <Grid>
                <Controller
                  name='spouseWeekendLocation'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Spouse Weekend Location'
                      fullWidth
                      error={!!errors.spouseWeekendLocation}
                      helperText={errors.spouseWeekendLocation?.message}
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </div>
      </Paper>
      {/* Address Section */}
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h6'
          gutterBottom
        >
          Address
        </Typography>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <Grid>
            <Controller
              name='addressLine1'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Address Line 1'
                  fullWidth
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='addressLine2'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Address Line 2 (Optional)'
                  fullWidth
                  error={!!errors.addressLine2}
                  helperText={errors.addressLine2?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='city'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='City'
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='state'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='State'
                  fullWidth
                  error={!!errors.state}
                  helperText={errors.state?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='zip'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='ZIP Code'
                  fullWidth
                  error={!!errors.zip}
                  helperText={errors.zip?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Phone Number'
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='dateOfBirth'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Date of Birth'
                  type='date'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='age'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Age'
                  type='number'
                  fullWidth
                  error={!!errors.age}
                  helperText={errors.age?.message}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              )}
            />
          </Grid>
        </div>
      </Paper>

      {/* Emergency Contact & Health Section */}
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h6'
          gutterBottom
        >
          Emergency Contact & Health Information
        </Typography>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <Grid>
            <Controller
              name='emergencyContactName'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Emergency Contact Name'
                  fullWidth
                  error={!!errors.emergencyContactName}
                  helperText={errors.emergencyContactName?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='emergencyContactPhone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Emergency Contact Phone'
                  fullWidth
                  error={!!errors.emergencyContactPhone}
                  helperText={errors.emergencyContactPhone?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <YesNoField
              name='coveredByInsurance'
              control={control}
              label='Are you covered by insurance?'
              error={errors.coveredByInsurance?.message}
            />
          </Grid>

          {coveredByInsurance && (
            <Grid>
              <Controller
                name='insuranceInformation'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Insurance Information'
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.insuranceInformation}
                    helperText={errors.insuranceInformation?.message}
                  />
                )}
              />
            </Grid>
          )}

          <Grid>
            <Controller
              name='allergies'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Allergies (Optional)'
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.allergies}
                  helperText={errors.allergies?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='allergyManagement'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Allergy Management (Optional)'
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.allergyManagement}
                  helperText={errors.allergyManagement?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <YesNoField
              name='hasMedication'
              control={control}
              label='Do you take any medications?'
              error={errors.hasMedication?.message}
            />
          </Grid>

          {hasMedication && (
            <Grid>
              <Controller
                name='medicationInformation'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Medication Information'
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.medicationInformation}
                    helperText={errors.medicationInformation?.message}
                  />
                )}
              />
            </Grid>
          )}

          <Grid>
            <Controller
              name='activityRestrictions'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Activity Restrictions (Optional)'
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.activityRestrictions}
                  helperText={errors.activityRestrictions?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='medicalConditions'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Medical Conditions (Optional)'
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.medicalConditions}
                  helperText={errors.medicalConditions?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='familyPhysician'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Family Physician'
                  fullWidth
                  error={!!errors.familyPhysician}
                  helperText={errors.familyPhysician?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='physicianPhone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Physician Phone'
                  fullWidth
                  error={!!errors.physicianPhone}
                  helperText={errors.physicianPhone?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='familyDentist'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Family Dentist'
                  fullWidth
                  error={!!errors.familyDentist}
                  helperText={errors.familyDentist?.message}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='dentistPhone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Dentist Phone'
                  fullWidth
                  error={!!errors.dentistPhone}
                  helperText={errors.dentistPhone?.message}
                />
              )}
            />
          </Grid>
        </div>
      </Paper>

      {/* Smoking & Special Assistance Section */}
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant='h6'
          gutterBottom
        >
          Smoking & Special Assistance
        </Typography>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <Grid>
            <YesNoField
              name='smokeOrVape'
              control={control}
              label='Do you smoke or vape?'
              error={errors.smokeOrVape?.message}
            />
          </Grid>

          <Grid>
            <Controller
              name='acknowledgedSmokeRules'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  }
                  label='I acknowledge the smoking rules and policies'
                />
              )}
            />
          </Grid>

          <Grid>
            <YesNoField
              name='requireSpecialAssistance'
              control={control}
              label='Do you require special assistance?'
              error={errors.requireSpecialAssistance?.message}
            />
          </Grid>
        </div>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          type='submit'
          variant='contained'
          size='large'
          disabled={isSubmitting}
          sx={{ minWidth: 200 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Box>
    </Box>
  )
}
