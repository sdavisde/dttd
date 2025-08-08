import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Meetings from './components/Meetings'
import { getValidatedUserWithPermissions, userHasPermission, UserPermissions } from '@/lib/security'
import { redirect } from 'next/navigation'
import { User } from '@/lib/users/types'

export default async function MeetingsPage() {
  let user: User

  try {
    user = await getValidatedUserWithPermissions([UserPermissions.READ_MEETINGS])
  } catch (error: unknown) {
    console.error(error)
    redirect(`/?error=${(error as Error).message}`)
  }

  const canEdit = userHasPermission(user, [UserPermissions.WRITE_MEETINGS])

  return (
    <>
      <AdminBreadcrumbs
        title='Meetings'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8 pb-8'>
        <Meetings canEdit={canEdit} />
      </div>
    </>
  )
}