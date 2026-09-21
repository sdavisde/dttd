import { Info } from 'lucide-react'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

export default function SettingsPage() {
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

        <div className="flex items-start gap-3 rounded-md border border-dashed border-input bg-card px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Fees, system email, and community branding will live here as
            they&apos;re built — deliberately left out for now.
          </p>
        </div>
      </div>
    </>
  )
}
