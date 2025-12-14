import { getBuckets } from '@/lib/files'
import { getStorageUsage } from '@/lib/storage'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/auth'
import { isErr } from '@/lib/results'
import Files from './components/Files'

export default async function FilesPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
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
