import { Suspense } from 'react'
import {
  CurrentWeekendView,
  CurrentWeekendViewSkeleton,
} from '@/components/current-weekend'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'

export default function CurrentWeekendPage() {
  return (
    <PageContent>
      <MemberBreadcrumbs
        title="The weekends"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <Suspense fallback={<CurrentWeekendViewSkeleton />}>
        <CurrentWeekendView />
      </Suspense>
    </PageContent>
  )
}
