import { Suspense } from 'react'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { redirect } from 'next/navigation'
import {
  WeekendRosterView,
  WeekendRosterViewSkeleton,
} from '@/components/weekend'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/services/weekend'
import { formatWeekendTitle } from '@/lib/weekend'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({
  params,
}: WeekendDetailPageProps) {
  const { weekend_id } = await params

  // Auth (for permission checks) runs concurrently with the breadcrumb title
  // lookup; the redirect below still fires before anything renders.
  const [userResult, weekendResult] = await Promise.all([
    getLoggedInUser(),
    getWeekendById(weekend_id),
  ])

  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data

  const weekendTitle = !isErr(weekendResult)
    ? formatWeekendTitle(weekendResult.data)
    : 'Weekend'

  return (
    <>
      <AdminBreadcrumbs
        title={weekendTitle}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' },
        ]}
      />
      <div className="container mx-auto px-8 py-2 md:py-4">
        <Suspense fallback={<WeekendRosterViewSkeleton />}>
          <WeekendRosterView weekendId={weekend_id} user={user} />
        </Suspense>
      </div>
    </>
  )
}
