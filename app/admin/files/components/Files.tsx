'use client'

import { useState } from 'react'
import { StorageUsage } from '@/components/storage-usage'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { Folder, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CreateFolderSidebar } from '@/components/file-management/CreateFolderSidebar'
import { deleteFolder } from '@/actions/file-management'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
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
      toast.error(res.error)
    } else {
      toast.success(`Folder ${folderName} deleted successfully`)
      router.refresh()
    }
  }

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Typography variant="h4" className="mb-2">
            File Management
          </Typography>
          <Typography variant="muted">
            Manage files and folders organized by bucket.
          </Typography>
        </div>
      </div>

      <div className="mb-6">
        <StorageUsage usedBytes={usedBytes} totalBytes={totalBytes} />
      </div>

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
            <Table key={bucket.name}>
              <TableHeader>
                <TableRow>
                  <TableHead>{bucket.name}</TableHead>
                  <TableHead className="sticky right-0 bg-background text-right border-l">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bucket.folders.length === 0 ? (
                  <div className="p-4 text-center">
                    <Typography variant="muted" className="italic">
                      No folders available
                    </Typography>
                  </div>
                ) : (
                  bucket.folders.map((folder) => (
                    <TableRow key={folder.slug}>
                      <TableCell>
                        <Link
                          key={folder.slug}
                          href={`/admin/files/${folder.slug}`}
                          className="flex items-center gap-3 hover:bg-muted/50 transition-colors"
                        >
                          <Folder className="h-5 w-5 text-muted-foreground" />
                          <span className="capitalize font-medium">
                            {folder.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="sticky right-0 bg-background text-right border-l">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteFolder(bucket.name, folder.name)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-700" />
                          <span className="sr-only">Delete folder</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateFolder(bucket.name)}
                    >
                      <Plus className="h-4 w-4" />
                      Create folder
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ))}
        </div>
      )}

      <CreateFolderSidebar
        bucketName={selectedBucket || ''}
        isOpen={isCreateSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}
