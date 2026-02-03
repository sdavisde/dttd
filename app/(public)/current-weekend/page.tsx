import { isErr } from '@/lib/results'
import { getLoggedInUser } from '@/services/identity/user'
import { CurrentWeekendView } from '@/components/current-weekend/CurrentWeekendView'

export default async function CurrentWeekendPage() {
  const user = await getLoggedInUser()

  if (isErr(user)) {
    return <div>Error: {user.error}</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <CurrentWeekendView />
    </div>
  )
}
