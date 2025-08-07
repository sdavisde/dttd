import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Meetings } from './components/Meetings'

export default async function MeetingsPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['FULL_ACCESS'])(user)
  } catch (error) {
    redirect('/')
  }

  return (
    <>
      <AdminBreadcrumbs
        title='Meetings'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8 pb-8'>
        <Meetings user={user} />
      </div>
    </>
  )
}