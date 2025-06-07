'use client'

import { Box, Container, Typography, Button, Paper, TextField, Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormRadioGroup } from '@/components/form/FormRadioGroup'

const sponsorFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email address'),
  sponsorName: z.string().min(1, 'Sponsor name is required'),
  sponsorAddress: z.string().min(1, 'Address is required'),
  sponsorPhone: z.string().min(1, 'Phone number is required'),
  sponsorChurch: z.string().min(1, 'Church is required'),
  sponsorWeekend: z.string().min(1, 'Weekend information is required'),
  reunionGroup: z.string().min(1, 'Reunion group information is required'),
  attendsSecuela: z.string().min(1, 'Please select an option'),
  contactFrequency: z.string().min(1, 'Contact frequency is required'),
  churchEnvironment: z.string().min(1, 'Church environment description is required'),
  homeEnvironment: z.string().min(1, 'Home environment description is required'),
  socialEnvironment: z.string().min(1, 'Social environment description is required'),
  workEnvironment: z.string().min(1, 'Work environment description is required'),
  godEvidence: z.string().min(1, "Evidence of God's leading is required"),
  supportPlan: z.string().min(1, 'Support plan is required'),
  prayerRequest: z.string().min(1, 'Prayer request information is required'),
  submittingMultiple: z.string().min(1, 'Please select an option'),
  additionalCandidates: z.string(),
  paymentOwner: z.string().min(1, 'Payment owner is required'),
})

type SponsorFormSchema = z.infer<typeof sponsorFormSchema>

export function SponsorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SponsorFormSchema>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      candidateName: '',
      candidateEmail: '',
      sponsorName: '',
      sponsorAddress: '',
      sponsorPhone: '',
      sponsorChurch: '',
      sponsorWeekend: '',
      reunionGroup: '',
      attendsSecuela: '',
      contactFrequency: '',
      churchEnvironment: '',
      homeEnvironment: '',
      socialEnvironment: '',
      workEnvironment: '',
      godEvidence: '',
      supportPlan: '',
      prayerRequest: '',
      submittingMultiple: '',
      additionalCandidates: '',
      paymentOwner: '',
    },
  })

  const onSubmit = async (data: SponsorFormSchema) => {
    try {
      // TODO: Implement form submission
      console.log(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Container maxWidth='md'>
      <Paper
        elevation={3}
        sx={{ p: 4, my: 4 }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Sponsor a Candidate
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            direction='column'
            spacing={2}
          >
            <Grid>
              <Typography
                variant='h6'
                gutterBottom
              >
                Basic Information
              </Typography>
            </Grid>

            <Grid>
              <TextField
                {...register('candidateName')}
                label='Candidate Name'
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('candidateEmail')}
                label='Candidate Email'
                type='email'
                required
                fullWidth
              />
            </Grid>

            {/* Sponsor Information */}
            <Grid>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ mt: 2 }}
              >
                Sponsor Information
              </Typography>
            </Grid>

            <Grid>
              <TextField
                {...register('sponsorName')}
                label="Sponsor's Name"
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsorPhone')}
                label="Sponsor's Phone #"
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsorAddress')}
                label="Sponsor's Address"
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsorChurch')}
                label="Sponsor's Church"
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsorWeekend')}
                label="Sponsor's Weekend Attended & Where"
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('reunionGroup')}
                label="Sponsor's Reunion Group Name & Location"
                required
                fullWidth
              />
            </Grid>

            {/* Additional Questions */}
            <Grid>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ mt: 2 }}
              >
                Additional Questions
              </Typography>
            </Grid>

            <Grid>
              <FormRadioGroup
                name='attendsSecuela'
                register={register}
                label='Do you attend Secuela regularly?'
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'occasionally', label: 'Occasionally' },
                  { value: 'na', label: 'N/A' },
                ]}
                required
              />
            </Grid>

            <Grid>
              <TextField
                {...register('contactFrequency')}
                label='How often do you have contact with candidate?'
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <Typography
                variant='subtitle1'
                gutterBottom
              >
                Describe the environment (situations) of EACH below regarding the candidate:
              </Typography>
            </Grid>

            <Grid>
              <TextField
                {...register('churchEnvironment')}
                label='Church'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('homeEnvironment')}
                label='Home'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('socialEnvironment')}
                label='Social/Civic'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('workEnvironment')}
                label='Work'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('godEvidence')}
                label='What evidence have you seen that God is leading the candidate to this weekend?'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('supportPlan')}
                label='How do you intend to support the candidate before, during and after the weekend (4th Day)?'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <TextField
                {...register('prayerRequest')}
                label='Has the candidate asked you to submit a specific prayer request on his/her behalf?'
                multiline
                rows={3}
                required
                fullWidth
              />
            </Grid>

            <Grid>
              <FormRadioGroup
                name='paymentOwner'
                register={register}
                label='Who is paying for the candidate?'
                options={[
                  { value: 'sponsor', label: 'Sponsor' },
                  { value: 'candidate', label: 'Candidate' },
                ]}
                required
              />
            </Grid>

            <Grid>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                size='large'
                sx={{ mt: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  )
}
