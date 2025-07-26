import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getStorageUsage } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'
import { FileUpload } from '@/components/file-upload'
import { FileList } from '@/components/file-list'
import { CreateFolderButton } from '@/components/create-folder-button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { HomeIcon } from 'lucide-react'
import { err, isErr, ok, Result } from '@/lib/results'
import { unslugify } from '@/util/url'

type FileSystemItem = {
  name: string
  isFolder: boolean
  size?: number
  updated_at?: string
  metadata?: any
}

async function getFileSystemItems(
  bucket: string = 'files',
  path: string = ''
): Promise<Result<string, FileSystemItem[]>> {
  const supabase = await createClient()
  const { data: items, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    return err(`Error fetching items for ${bucket}/${path}: ${error.message}`)
  }

  return ok(
    items
      .filter((item) => item.name !== '.placeholder') // Filter out placeholder files
      .map((item) => ({
        name: item.name,
        isFolder: item.metadata === null,
        size: item.metadata?.size,
        updated_at: item.updated_at,
        metadata: item.metadata,
      }))
      .sort((a, b) => {
        // Folders first, then files, both alphabetically
        if (a.isFolder && !b.isFolder) return -1
        if (!a.isFolder && b.isFolder) return 1
        return a.name.localeCompare(b.name)
      })
  )
}

async function fetchFolderContents(
  pathSegments: string[]
): Promise<Result<string, Array<FileSystemItem>>> {
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
  const currentBucket = 'files'

  // Validate that the path exists
  const contentsResult = await fetchFolderContents(pathSegments)
  if (isErr(contentsResult)) {
    console.error(contentsResult.error)
    notFound()
  }

  const usedBytes = await getStorageUsage()
  const totalBytes = 1024 * 1024 * 1024 // 1 GB in bytes

  const currentPathname = pathSegments.join('/')

  // Create breadcrumb path
  const breadcrumbs = [
    { name: 'Files', path: '' },
    ...pathSegments.map((segment, index) => ({
      name: unslugify(segment),
      path: pathSegments.slice(0, index + 1).join('/'),
    })),
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Storage Usage */}
      <StorageUsage usedBytes={usedBytes} totalBytes={totalBytes} />

      {/* File Vault */}
      <Card>
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">File Vault</h1>
              <span className="text-sm opacity-90">{currentBucket} bucket</span>
            </div>
            <div className="flex gap-2">
              <FileUpload folder={currentPathname} />
              <CreateFolderButton
                bucketName={currentBucket}
                currentPath={currentPathname}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Breadcrumb Navigation */}
          <div className="p-4 border-b">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === 0 && <HomeIcon className="w-4 h-4 mr-1" />}
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="font-medium">
                          {crumb.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={
                            crumb.path === ''
                              ? '/admin/files'
                              : `/admin/files/${crumb.path}`
                          }
                          className="hover:text-primary"
                        >
                          {crumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* File/Folder List */}
          <FileList
            items={contentsResult.data}
            currentBucket={currentBucket}
            currentPath={currentPathname}
          />
        </CardContent>
      </Card>
    </div>
  )
}
