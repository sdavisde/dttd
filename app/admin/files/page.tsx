import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { getStorageUsage } from '@/lib/storage'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { isErr } from '@/lib/results'
import Files from './components/Files'

async function getBuckets() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error('Error fetching buckets:', bucketsError)
    return []
  }

  return buckets.map((bucket) => ({ name: bucket.name, folders: [] }))
}

export default async function FilesPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['FILES_UPLOAD', 'FILES_DELETE'])(user)
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
