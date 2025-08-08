import { getBuckets } from '@/lib/files'
import { getStorageUsage } from '@/lib/storage'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { getValidatedUserWithPermissions } from '@/lib/security'
import { redirect } from 'next/navigation'
import Files from './components/Files'
import { User } from '@/lib/users/types'

export default async function FilesPage() {
  let user: User

  try {
    user = await getValidatedUserWithPermissions(['FILES_UPLOAD', 'FILES_DELETE'])
  } catch (error) {
    redirect('/')
  }

  const buckets = await getBuckets()
  const usedBytes = await getStorageUsage()
  const totalBytes = 1024 * 1024 * 1024 // 1 GB in bytes

  return (
    <>
      <AdminBreadcrumbs
        title="Files"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Files
          buckets={buckets}
          usedBytes={usedBytes}
          totalBytes={totalBytes}
        />
      </div>
    </>
  )
}
