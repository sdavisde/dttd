import { createClient } from '@/lib/supabase/server'
import { ContactInformationTable } from './components/ContactInformationTable'
import { PrayerWheelSettings } from './components/PrayerWheelSettings'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { getPrayerWheelUrls } from '@/services/settings'
import { isErr, Results } from '@/lib/results'

async function getContactInformation() {
  const supabase = await createClient()
  // TODO: want to move pre-weekend couple to the board page
  const { data, error } = await supabase
    .from('contact_information')
    .select('*')
    .order('label')

  if (error) {
    console.error('Error fetching contact information:', error)
    return []
  }

  return data ?? []
}

export default async function SettingsPage() {
  const contactInformation = await getContactInformation()
  const prayerWheelResult = await getPrayerWheelUrls()
  const prayerWheelUrls = Results.unwrapOr(prayerWheelResult, {
    mens: '',
    womens: '',
  })

  return (
    <>
      <AdminBreadcrumbs
        title="Settings"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <div className="my-4">
          <Typography variant="muted" className="mb-4">
            Manage system settings and configurations.
          </Typography>

          <div className="mb-4">
            <Typography variant="h4">DTTD Email Addresses</Typography>
            <Typography variant="muted" className="mb-4">
              Manage contact information used throughout the system.
            </Typography>
            <ContactInformationTable contactInformation={contactInformation} />
          </div>

          <div className="mb-4">
            <Typography variant="h4">Prayer Wheel Links</Typography>
            <Typography variant="muted" className="mb-4">
              Manage the SignUpGenius prayer wheel URLs displayed on the
              dashboard.
            </Typography>
            <PrayerWheelSettings prayerWheelUrls={prayerWheelUrls} />
          </div>
        </div>
      </div>
    </>
  )
}
