import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Meetings from './components/Meetings'
import { getValidatedUser, userHasPermission, UserPermissions } from '@/lib/security'

export default async function MeetingsPage() {
  const user = await getValidatedUser()

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