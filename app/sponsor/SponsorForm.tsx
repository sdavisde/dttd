'use client'

import { Box, Container, Typography, Button, Paper, TextField, Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormRadioGroup } from '@/components/form/FormRadioGroup'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { sendSponsorshipNotificationEmail } from '@/actions/emails'
import * as Results from '@/lib/results'
import { useSession } from '@/components/auth/session-provider'

const sponsorFormSchema = z.object({
  candidate_name: z.string().min(1, 'Candidate name is required'),
  candidate_email: z.string().email('Invalid email address'),
  sponsor_name: z.string().min(1, 'Sponsor name is required'),
  sponsor_address: z.string().min(1, 'Address is required'),
  sponsor_phone: z.string().min(1, 'Phone number is required'),
  sponsor_church: z.string().min(1, 'Church is required'),
  sponsor_weekend: z.string().min(1, 'Weekend information is required'),
  reunion_group: z.string().min(1, 'Reunion group information is required'),
  attends_secuela: z.string().min(1, 'Please select an option'),
  contact_frequency: z.string().min(1, 'Contact frequency is required'),
  church_environment: z.string().min(1, 'Church environment description is required'),
  home_environment: z.string().min(1, 'Home environment description is required'),
  social_environment: z.string().min(1, 'Social environment description is required'),
  work_environment: z.string().min(1, 'Work environment description is required'),
  god_evidence: z.string().min(1, "Evidence of God's leading is required"),
  support_plan: z.string().min(1, 'Support plan is required'),
  prayer_request: z.string(),
  payment_owner: z.string().min(1, 'Payment owner is required'),
})

type SponsorFormSchema = z.infer<typeof sponsorFormSchema>

export function SponsorForm() {
  const router = useRouter()
  const { user } = useSession()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SponsorFormSchema>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      candidate_name: '',
      candidate_email: '',
      sponsor_name: '',
      sponsor_address: '',
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
      logger.info('Submitting sponsor form:', data)

      if (!user?.email) {
        throw new Error('Current user email not found')
      }

      // Add the sponsor's email to the form data
      const formDataWithSponsorEmail = {
        ...data,
        sponsor_email: user.email,
      }

      logger.info('Submitting sponsor form with sponsor email:', formDataWithSponsorEmail)

      const supabase = createClient()
      const { data: sponsorshipRequest, error: sponsorshipRequestError } = await supabase
        .from('sponsorship_request')
        .insert(formDataWithSponsorEmail)
        .select()
        .single()

      if (sponsorshipRequestError) {
        throw new Error(sponsorshipRequestError.message)
      }

      // Now that a sponsorship request has been created, we need to send the preweekend couple an email
      const emailNotificationResult = await sendSponsorshipNotificationEmail(sponsorshipRequest.id)
      if (Results.isErr(emailNotificationResult)) {
        throw new Error(`Error sending sponsorship notification email: ${emailNotificationResult.error.message}`)
      }

      logger.info('Sponsorship notification email sent successfully')
      logger.info('Form submitted successfully:', sponsorshipRequest)
      router.push(`/sponsor/submitted?id=${sponsorshipRequest.id}`)
    } catch (error) {
      logger.error('Error submitting form:', error)
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
                {...register('candidate_name')}
                label='Candidate Name'
                required
                fullWidth
                error={!!errors.candidate_name}
                helperText={errors.candidate_name?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('candidate_email')}
                label='Candidate Email'
                type='email'
                required
                fullWidth
                error={!!errors.candidate_email}
                helperText={errors.candidate_email?.message}
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
                {...register('sponsor_name')}
                label="Sponsor's Name"
                required
                fullWidth
                error={!!errors.sponsor_name}
                helperText={errors.sponsor_name?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsor_phone')}
                label="Sponsor's Phone #"
                required
                fullWidth
                error={!!errors.sponsor_phone}
                helperText={errors.sponsor_phone?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsor_address')}
                label="Sponsor's Address"
                required
                fullWidth
                error={!!errors.sponsor_address}
                helperText={errors.sponsor_address?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsor_church')}
                label="Sponsor's Church"
                required
                fullWidth
                error={!!errors.sponsor_church}
                helperText={errors.sponsor_church?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('sponsor_weekend')}
                label="Sponsor's Weekend Attended & Where"
                required
                fullWidth
                error={!!errors.sponsor_weekend}
                helperText={errors.sponsor_weekend?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('reunion_group')}
                label="Sponsor's Reunion Group Name & Location"
                required
                fullWidth
                error={!!errors.reunion_group}
                helperText={errors.reunion_group?.message}
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
                name='attends_secuela'
                control={control}
                label='Do you attend Secuela regularly?'
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'occasionally', label: 'Occasionally' },
                  { value: 'na', label: 'N/A' },
                ]}
                required
                error={!!errors.attends_secuela}
                helperText={errors.attends_secuela?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('contact_frequency')}
                label='How often do you have contact with candidate?'
                required
                fullWidth
                error={!!errors.contact_frequency}
                helperText={errors.contact_frequency?.message}
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
                {...register('church_environment')}
                label='Church'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.church_environment}
                helperText={errors.church_environment?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('home_environment')}
                label='Home'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.home_environment}
                helperText={errors.home_environment?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('social_environment')}
                label='Social/Civic'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.social_environment}
                helperText={errors.social_environment?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('work_environment')}
                label='Work'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.work_environment}
                helperText={errors.work_environment?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('god_evidence')}
                label='What evidence have you seen that God is leading the candidate to this weekend?'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.god_evidence}
                helperText={errors.god_evidence?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('support_plan')}
                label='How do you intend to support the candidate before, during and after the weekend (4th Day)?'
                multiline
                rows={3}
                required
                fullWidth
                error={!!errors.support_plan}
                helperText={errors.support_plan?.message}
              />
            </Grid>

            <Grid>
              <TextField
                {...register('prayer_request')}
                label='Has the candidate asked you to submit a specific prayer request on his/her behalf?'
                multiline
                rows={3}
                fullWidth
                error={!!errors.prayer_request}
                helperText={errors.prayer_request?.message}
              />
            </Grid>

            <Grid>
              <FormRadioGroup
                name='payment_owner'
                control={control}
                label='Who is paying for the candidate?'
                options={[
                  { value: 'sponsor', label: 'Sponsor' },
                  { value: 'candidate', label: 'Candidate' },
                ]}
                required
                error={!!errors.payment_owner}
                helperText={errors.payment_owner?.message}
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
