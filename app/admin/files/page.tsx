import { getBuckets } from '@/lib/files'
import { getStorageUsage, STORAGE_QUOTA_BYTES } from '@/lib/storage'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import Files from './components/Files'
import { isNil } from 'lodash'

export default async function FilesPage() {
  // Auth runs concurrently with the storage reads; the redirect below still
  // fires before anything renders.
  const [userResult, buckets, usedBytes] = await Promise.all([
    getLoggedInUser(),
    getBuckets(),
    getStorageUsage(),
  ])
  const user = userResult?.data

  try {
    if (isErr(userResult) || isNil(user)) {
      throw new Error('User not found')
    }
  } catch (error) {
    redirect('/')
  }

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
          totalBytes={STORAGE_QUOTA_BYTES}
        />
      </div>
    </>
  )
}
