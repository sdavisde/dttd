import { createClient } from '@/lib/supabase/server'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { ContactInformationTable } from './components/ContactInformationTable'
import { getLoggedInUser } from '@/actions/users'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { isErr } from '@/lib/results'

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
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['ADMIN'])(user)
  } catch (error) {
    redirect('/')
  }

  const contactInformation = await getContactInformation()

  return (
    <>
      <AdminBreadcrumbs
        title='Settings'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8'>
        <div className='my-4'>
          <Typography
            variant='muted'
            className='mb-4'
          >
            Manage system settings and configurations.
          </Typography>

          <div className='mb-4'>
            <Typography variant='h4'>DTTD Email Addresses</Typography>
            <Typography
              variant='muted'
              className='mb-4'
            >
              Manage contact information used throughout the system.
            </Typography>
            <ContactInformationTable contactInformation={contactInformation} />
          </div>
        </div>
      </div>
    </>
  )
}
