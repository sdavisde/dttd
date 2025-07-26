import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getStorageUsage } from '@/lib/storage'
import { err, isErr, ok, Result } from '@/lib/results'
import { unslugify } from '@/util/url'
import FilesFolderContent from '@/components/file-management/FilesFolderContent'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { FileObject } from '@supabase/storage-js'

async function getFileSystemItems(
  bucket: string = 'files',
  path: string = ''
): Promise<Result<string, FileObject[]>> {
  const supabase = await createClient()
  const { data: items, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    return err(`Error fetching items for ${bucket}/${path}: ${error.message}`)
  }

  return ok(
    items
      .filter((item) => item.name !== '.placeholder') // Filter out placeholder files
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}

async function fetchFolderContents(
  pathSegments: string[]
): Promise<Result<string, Array<FileObject>>> {
  if (pathSegments.length === 0) return ok([])
  const folderPath = pathSegments.map(unslugify)

  const supabase = await createClient()
  let currentPath = ''

  for (const segment of folderPath) {
    const { data: items, error } = await supabase.storage
      .from('files')
      .list(currentPath)

    if (error) {
      return err(`Error validating path segment ${segment}: ${error.message}`)
    }

    const folderExists = items.some(
      // Looking for the next folder in the path segment in supabase file bucket
      (item) => item.metadata === null && item.name === segment
    )

    if (!folderExists) {
      return err(`Cannot find ${segment} in files/${currentPath}`)
    }

    currentPath = currentPath ? `${currentPath}/${segment}` : segment
  }

  return getFileSystemItems('files', currentPath)
}

export default async function FilesNestedPage({
  params,
}: {
  params: Promise<{ path: string[] | string }>
}) {
  let { path: pathSegments } = await params
  pathSegments =
    typeof pathSegments === 'string' ? [pathSegments] : pathSegments

  const contentsResult = await fetchFolderContents(pathSegments)
  if (isErr(contentsResult)) {
    console.error(contentsResult.error)
    notFound()
  }

  const folderName = unslugify(pathSegments.at(-1) ?? 'Files')

  return (
    <div className="min-h-[80vh]">
      <AdminBreadcrumbs
        title={folderName}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Files', href: '/admin/files' },
        ]}
      />
      <div className="container mx-auto px-8">
        <FilesFolderContent
          files={contentsResult.data}
          folderName={folderName}
        />
      </div>
    </div>
  )
}
