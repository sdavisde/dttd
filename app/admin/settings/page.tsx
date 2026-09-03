import { Info } from 'lucide-react'
import { PrayerWheelSettings } from './components/PrayerWheelSettings'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
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
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <PageHeader
          title="Site settings"
          description="The knobs that rarely turn — changes apply to the whole site."
        />

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Card className="gap-0 py-0">
              <CardContent className="px-5 py-4">
                <h2 className="font-serif text-lg font-semibold tracking-tight">
                  Prayer wheel
                </h2>
                <p className="pb-4 text-[13px] text-muted-foreground">
                  The SignUpGenius prayer wheel links shown on the home page.
                </p>
                <PrayerWheelSettings prayerWheelUrls={prayerWheelUrls} />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-start gap-3 rounded-md border border-dashed border-input bg-card px-5 py-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Fees, system email, and community branding will live here as
              they&apos;re built — deliberately left out for now.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
