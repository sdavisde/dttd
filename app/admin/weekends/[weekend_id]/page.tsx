import { Suspense } from 'react'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Users } from 'lucide-react'
import {
  WeekendRosterView,
  WeekendRosterViewSkeleton,
  WeekendStatusBadge,
} from '@/components/weekend'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/services/weekend'
import { formatWeekendTitle } from '@/lib/weekend'
import { formatDateRange } from '@/lib/utils'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({
  params,
}: WeekendDetailPageProps) {
  const { weekend_id } = await params

  // Auth (for permission checks) runs concurrently with the weekend lookup;
  // the redirect below still fires before anything renders.
  const [userResult, weekendResult] = await Promise.all([
    getLoggedInUser(),
    getWeekendById(weekend_id),
  ])

  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data

  // An unknown (or unreadable) weekend id gets the admin not-found page rather
  // than the generic error boundary that the roster view used to throw into.
  if (isErr(weekendResult)) {
    notFound()
  }
  const weekend = weekendResult.data
  const weekendTitle = formatWeekendTitle(weekend)

  return (
    <>
      <AdminBreadcrumbs
        title={weekendTitle}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' },
        ]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <PageHeader
          title={weekendTitle}
          description={`${formatDateRange(weekend.start_date, weekend.end_date)} — team roster and weekend details.`}
        >
          {!isNil(weekend.status) && (
            <WeekendStatusBadge status={weekend.status} />
          )}
          {!isNil(weekend.groupId) && (
            <Button asChild variant="outline">
              <Link
                href={`/candidate-list?weekend=${weekend.groupId}&weekendType=${weekend.type}`}
                title="Opens the community candidate list, outside Admin"
              >
                <Users className="h-4 w-4" />
                Candidate list
                <ArrowUpRight className="h-4 w-4" aria-hidden />
                <span className="sr-only">(leaves Admin)</span>
              </Link>
            </Button>
          )}
        </PageHeader>
        <Suspense fallback={<WeekendRosterViewSkeleton hideWeekendHeader />}>
          <WeekendRosterView
            weekendId={weekend_id}
            user={user}
            hideWeekendHeader
          />
        </Suspense>
      </div>
    </>
  )
}
