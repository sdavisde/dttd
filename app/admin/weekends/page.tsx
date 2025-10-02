import { getAllWeekends } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Weekends from './components/Weekends'

export default async function WeekendsPage() {
  const weekendsResult = await getAllWeekends()

  if (isErr(weekendsResult)) {
    throw new Error(`Failed to fetch weekends: ${weekendsResult.error.message}`)
  }

  const weekends = weekendsResult.data

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingWeekends = weekends
    .filter((weekend) => new Date(weekend.end_date) >= today)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )

  const pastWeekends = weekends
    .filter((weekend) => new Date(weekend.end_date) < today)
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )

  const canEdit = true

  return (
    <>
      <AdminBreadcrumbs
        title="Weekends"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 pb-8">
        <Weekends
          canEdit={canEdit}
          upcomingWeekends={upcomingWeekends}
          pastWeekends={pastWeekends}
        />
      </div>
    </>
  )
}
