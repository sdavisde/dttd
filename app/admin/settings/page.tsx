import { PrayerWheelSettings } from './components/PrayerWheelSettings'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { getPrayerWheelUrls } from '@/services/settings'
import { Results } from '@/lib/results'

export default async function SettingsPage() {
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
