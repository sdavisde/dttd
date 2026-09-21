import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <AdminBreadcrumbs
        title="Weekend not found"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' },
        ]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <PageHeader
          title="Weekend not found"
          description="That weekend either never existed or has since been removed."
          shareable={false}
        />
        <div className="rounded-lg border bg-card px-6 py-8 text-center">
          <p className="text-muted-foreground">
            Check the link you followed, or pick the weekend from the list.
          </p>
          <Button asChild className="mt-5">
            <Link href="/admin/weekends">Back to Weekends</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
