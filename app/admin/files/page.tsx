import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { CreateFolderButton } from '@/components/create-folder-button'
import { getStorageUsage } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'
import { FileUpload } from '@/components/file-upload'
import { FileList } from '@/components/file-list'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'

type FileSystemItem = {
  name: string
  isFolder: boolean
  size?: number
  updated_at?: string
  metadata?: any
}

async function getFileSystemItems(bucket: string = 'files', path: string = ''): Promise<FileSystemItem[]> {
  const supabase = await createClient()
  const { data: items, error } = await supabase.storage.from(bucket).list(path)

  if (error) {
    logger.error(`Error fetching items for ${bucket}/${path}:`, error)
    return []
  }

  return items
    .filter(item => item.name !== '.placeholder') // Filter out placeholder files
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
}

async function getBuckets() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error('Error fetching buckets:', bucketsError)
    return []
  }

  return buckets.map(bucket => ({ name: bucket.name }))
}

export default async function FilesPage() {
  const currentPath: string = ''
  const currentBucket = 'files'
  
  const buckets = await getBuckets()
  const items = await getFileSystemItems(currentBucket, currentPath)
  const usedBytes = await getStorageUsage()
  const totalBytes = 1024 * 1024 * 1024 // 1 GB in bytes

  // Create breadcrumb path
  const pathSegments = currentPath ? currentPath.split('/').filter(Boolean) : []
  const breadcrumbs = [
    { name: 'Files', path: '' },
    ...pathSegments.map((segment, index) => ({
      name: segment,
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
              <FileUpload folder={currentPath} />
              <CreateFolderButton bucketName={currentBucket} currentPath={currentPath} />
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
                          href={crumb.path === '' ? '/admin/files' : `/admin/files/${crumb.path}`}
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
            items={items}
            currentBucket={currentBucket}
            currentPath={currentPath}
          />
        </CardContent>
      </Card>

      {/* Bucket Selector (if multiple buckets exist) */}
      {buckets.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Available Buckets</h2>
            <div className="flex gap-2 flex-wrap">
              {buckets.map((bucket) => (
                <Button
                  key={bucket.name}
                  variant={currentBucket === bucket.name ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <a href={`/admin/files`}>
                    {bucket.name}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}