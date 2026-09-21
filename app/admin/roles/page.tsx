import { Permission } from '@/lib/security'
import { guardAdminPage } from '@/lib/admin/page-guard'
import { getRoles } from '@/services/identity/roles'
import Roles from '@/app/admin/roles/components/Roles'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default async function RolesPage() {
  const [{ canEdit: canWrite }, rolesResult] = await Promise.all([
    guardAdminPage({
      required: [Permission.READ_USER_ROLES],
      edit: [Permission.WRITE_USER_ROLES],
    }),
    getRoles(),
  ])

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Security"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <Roles roles={rolesResult.data} readOnly={!canWrite} />
      </div>
    </>
  )
}
