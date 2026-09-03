'use client'

import { useState } from 'react'
import { StorageUsage } from '@/components/storage-usage'
import { PageHeader } from '@/components/ui/page-header'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { Folder, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CreateFolderSidebar } from '@/components/file-management/CreateFolderSidebar'
import { deleteFolder } from '@/actions/file-management'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import { toastError } from '@/lib/toast-error'
import { useRouter } from 'next/navigation'

type Bucket = {
  name: string
  folders: {
    name: string
    slug: string
  }[]
}

type FilesProps = {
  buckets: Bucket[]
  usedBytes: number
  totalBytes: number
}

export default function Files({ buckets, usedBytes, totalBytes }: FilesProps) {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false)
  const router = useRouter()

  const handleCreateFolder = (bucketName: string) => {
    setSelectedBucket(bucketName)
    setIsCreateSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSelectedBucket(null)
    setIsCreateSidebarOpen(false)
  }

  const handleDeleteFolder = async (bucketName: string, folderName: string) => {
    const res = await deleteFolder(bucketName, folderName)
    if (isErr(res)) {
      toastError('Unable to delete folder. Please try again.', {
        error: res.error,
      })
    } else {
      toast.success(`Folder ${folderName} deleted successfully`)
      router.refresh()
    }
  }

  return (
    <div className="py-6">
      <PageHeader
        title="Files"
        description="Upload, organize, and browse the community's files by folder."
      >
        <StorageUsage usedBytes={usedBytes} totalBytes={totalBytes} />
      </PageHeader>

      {buckets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Typography variant="muted">
              No files or folders available at this time.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {buckets.map((bucket) => (
            <div key={bucket.name}>
              <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {bucket.name}
              </div>
              <Card className="gap-0 py-0">
                <CardContent className="px-5 py-2">
                  {bucket.folders.length === 0 ? (
                    <Typography
                      variant="muted"
                      className="italic py-3 text-center"
                    >
                      No folders available
                    </Typography>
                  ) : (
                    bucket.folders.map((folder) => (
                      <div
                        key={folder.slug}
                        className="group flex items-center gap-3 border-b border-divider py-1.5 last:border-b-0"
                      >
                        <Link
                          href={`/admin/files/${folder.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1.5 text-foreground hover:bg-muted/60"
                        >
                          <Folder className="h-4.5 w-4.5 shrink-0 text-primary" />
                          <span className="truncate text-sm font-medium capitalize">
                            {folder.name}
                          </span>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleDeleteFolder(bucket.name, folder.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete folder</span>
                        </Button>
                      </div>
                    ))
                  )}
                  <div className="border-t border-divider py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => handleCreateFolder(bucket.name)}
                    >
                      <Plus className="h-4 w-4" />
                      Create folder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <CreateFolderSidebar
        bucketName={selectedBucket ?? ''}
        isOpen={isCreateSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}
