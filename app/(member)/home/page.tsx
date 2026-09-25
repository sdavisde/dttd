import { isErr, Results } from '@/lib/results'
import { Dashboard } from './dashboard'
import { getLoggedInUser } from '@/services/identity/user'
import { getCachedPrayerWheelUrlForGender } from '@/services/settings/cached'
import { PageContent } from '@/components/member/page-content'

export default async function Home() {
  const user = await getLoggedInUser()

  if (isErr(user)) {
    return <div>Error: {user.error}</div>
  }

  const prayerWheelResult = await getCachedPrayerWheelUrlForGender(
    user.data.gender
  )
  const prayerWheelUrl = Results.unwrapOr(prayerWheelResult, null)

  return (
    <PageContent>
      <Dashboard user={user.data} prayerWheelUrl={prayerWheelUrl} />
    </PageContent>
  )
}
