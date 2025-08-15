import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <AdminBreadcrumbs
        title="Weekend Not Found"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' }
        ]}
      />
      <div className="container mx-auto px-8 py-6 text-center">
        <Typography variant="h1" className="text-6xl mb-4">404</Typography>
        <Typography variant="h2" className="mb-4">Weekend Not Found</Typography>
        <Typography variant="muted" className="mb-6">
          The weekend you're looking for doesn't exist or has been removed.
        </Typography>
        <Button asChild>
          <Link href="/admin/weekends">Back to Weekends</Link>
        </Button>
      </div>
    </>
  )
}