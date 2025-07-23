'use client'

import { useState } from 'react'
import { StorageUsage } from '@/components/storage-usage'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Folder } from 'lucide-react'
import Link from 'next/link'
import { CreateFolderButton } from '../[folder]/components/CreateFolderButton'
import { FolderSidebar } from '../[folder]/components/FolderSidebar'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleCreateFolder = (bucketName: string) => {
    setSelectedBucket(bucketName)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSelectedBucket(null)
    setIsSidebarOpen(false)
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

      <div className='mb-6'>
        <StorageUsage
          usedBytes={usedBytes}
          totalBytes={totalBytes}
        />
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
            <Card key={bucket.name}>
              <CardHeader className="bg-primary text-primary-foreground">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="capitalize">
                    {bucket.name}
                  </Typography>
                  <CreateFolderButton 
                    onClick={() => handleCreateFolder(bucket.name)} 
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bucket.folders.length === 0 ? (
                  <div className="p-4 text-center">
                    <Typography variant="muted" className="italic">
                      No folders available
                    </Typography>
                  </div>
                ) : (
                  <div className="divide-y">
                    {bucket.folders.map((folder) => (
                      <Link
                        key={folder.slug}
                        href={`/admin/files/${folder.slug}`}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <Folder className="h-5 w-5 text-muted-foreground" />
                        <span className="capitalize font-medium">{folder.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FolderSidebar
        bucketName={selectedBucket || ''}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}