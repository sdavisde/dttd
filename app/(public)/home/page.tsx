import { Dashboard } from './dashboard'
import { User } from '@/lib/users/types'
import { getValidatedUser } from '@/lib/security'
import { logger } from '@/lib/logger'

export default async function Home() {
  let user: User

  try {
    user = await getValidatedUser()
  } catch (e: unknown) {
    logger.error(e)
    return <div>Error: Please log in to access this page</div>

  }

  return (
    <div className='container mx-auto p-4 md:p-0'>
      <Dashboard user={user} />
    </div>
  )
}
