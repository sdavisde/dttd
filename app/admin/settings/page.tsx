import { Container, Typography, Box } from '@mui/material'
import { createClient } from '@/lib/supabase/server'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { ContactInformationTable } from './components/ContactInformationTable'
import { getUser } from '@/lib/supabase/user'

async function getContactInformation() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contact_information').select('*').order('label')

  if (error) {
    console.error('Error fetching contact information:', error)
    return []
  }

  return data || []
}

export default async function SettingsPage() {
  const user = await getUser()

  try {
    if (!user) {
      throw new Error('User not found')
    }
    permissionLock(['FULL_ACCESS'])(user)
  } catch (error) {
    redirect('/')
  }

  const contactInformation = await getContactInformation()

  return (
    <Container maxWidth='xl'>
      <Box sx={{ my: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Settings
        </Typography>
        <Typography
          variant='subtitle1'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Manage system settings and configurations.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h5'
            component='h2'
            gutterBottom
          >
            Contact Information
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2 }}
          >
            Manage contact information used throughout the system.
          </Typography>
          <ContactInformationTable contactInformation={contactInformation} />
        </Box>
      </Box>
    </Container>
  )
}
