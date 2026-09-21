import { Suspense } from 'react'
import { Info } from 'lucide-react'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { guardAdminPage } from '@/lib/admin/page-guard'
import { Permission } from '@/lib/security'
import {
  getNotificationToggles,
  getSystemEmailAddress,
} from '@/services/settings/settings-service'
import { EmailCard } from './components/email-card'
import { FeesCard, FeesCardSkeleton } from './components/fees-card'

export default async function SettingsPage() {
  const { canEdit } = await guardAdminPage({
    edit: [Permission.WRITE_SETTINGS],
  })

  const [systemEmailAddress, toggles] = await Promise.all([
    getSystemEmailAddress(),
    getNotificationToggles(),
  ])

  return (
    <>
      <AdminBreadcrumbs
        title="Settings"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 pb-10 sm:px-8 py-6">
        <PageHeader
          title="Site settings"
          description="The knobs that rarely turn — fees, wording, and email. Changes apply to the whole site."
        />

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Stripe is a third party: keep it off the page's critical path. */}
            <Suspense fallback={<FeesCardSkeleton />}>
              <FeesCard />
            </Suspense>

            <div className="flex items-start gap-3 rounded-md border border-dashed border-input bg-card px-5 py-4">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                Community branding and configuration will live here once
                organization onboarding is designed — deliberately left out for
                now.
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <EmailCard
              systemEmailAddress={systemEmailAddress}
              toggles={toggles}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </>
  )
}
