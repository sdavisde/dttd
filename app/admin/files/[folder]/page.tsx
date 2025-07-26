import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { FileObject } from '@supabase/storage-js'
import { logger } from '@/lib/logger'
import { slugify } from '@/util/url'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { permissionLock } from '@/lib/security'
import { getLoggedInUser } from '@/actions/users'
import { isErr } from '@/lib/results'
import FilesFolderContent from './components/FilesFolderContent'

async function getValidFolders() {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list()

  if (error) {
    throw error
  }

  return data
    .filter((item) => item.metadata === null)
    .map((folder) => ({
      name: folder.name,
      slug: slugify(folder.name),
    }))
}

export default async function FilesFolderPage({ params }: { params: Promise<{ folder: string }> }) {
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

  const { folder } = await params
  const validFolders = await getValidFolders()
  const availableSlugs = validFolders.map((folder) => folder.slug)
  const folderName = validFolders.find((f) => f.slug === folder)?.name

  if (!folderName) {
    logger.error(`Folder ${folder} not found in ${availableSlugs}`)
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list(folderName)

  if (error) {
    throw error
  }

  return (
    <>
      <AdminBreadcrumbs
        title={folderName}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Files', href: '/admin/files' }
        ]}
      />
      <div className='container mx-auto px-8'>
        <FilesFolderContent
          files={data as FileObject[]}
          folderName={folderName}
        />
      </div>
    </>
  )
}
