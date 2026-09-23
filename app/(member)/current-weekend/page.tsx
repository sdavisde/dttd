import { Suspense } from 'react'
import {
  CurrentWeekendView,
  CurrentWeekendViewSkeleton,
} from '@/components/current-weekend'

export default function CurrentWeekendPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<CurrentWeekendViewSkeleton />}>
        <CurrentWeekendView />
      </Suspense>
    </div>
  )
}
