import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { redirect } from 'next/navigation'
import { WeekendRosterView } from '@/components/weekend'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/services/weekend'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({
  params,
}: WeekendDetailPageProps) {
  const { weekend_id } = await params

  // Get logged in user for permission checks
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data

  // Fetch weekend info for breadcrumb title
  const weekendResult = await getWeekendById(weekend_id)
  const weekendTitle = !isErr(weekendResult)
    ? (weekendResult.data.title ??
      `${weekendResult.data.type} Weekend #${weekendResult.data.number}`)
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
        <WeekendRosterView weekendId={weekend_id} user={user} />
      </div>
    </>
  )
}
