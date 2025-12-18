import { isErr } from '@/lib/results'
import { Dashboard } from './dashboard'
import { getLoggedInUser } from '@/services/identity/user'

export default async function Home() {
  const user = await getLoggedInUser()

  if (isErr(user)) {
    return <div>Error: {user.error}</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-0">
      <Dashboard user={user.data} />
    </div>
  )
}
