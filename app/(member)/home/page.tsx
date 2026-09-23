import { isErr, Results } from '@/lib/results'
import { Dashboard } from './dashboard'
import { getLoggedInUser } from '@/services/identity/user'
import { getPrayerWheelUrlForGender } from '@/services/settings'

export default async function Home() {
  const user = await getLoggedInUser()

  if (isErr(user)) {
    return <div>Error: {user.error}</div>
  }

  const prayerWheelResult = await getPrayerWheelUrlForGender(user.data.gender)
  const prayerWheelUrl = Results.unwrapOr(prayerWheelResult, null)

  return (
    <div className="container mx-auto p-4 md:p-0">
      <Dashboard user={user.data} prayerWheelUrl={prayerWheelUrl} />
    </div>
  )
}
