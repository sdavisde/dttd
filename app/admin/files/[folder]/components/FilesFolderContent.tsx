'use client'

import { useState } from 'react'
import { FileObject } from '@supabase/storage-js'
import { Typography } from '@/components/ui/typography'
import { Folder } from 'lucide-react'
import { FileTable } from './FileTable'
import { FileUpload } from './FileUpload'
import { CreateFolderButton } from './CreateFolderButton'
import { FolderSidebar } from './FolderSidebar'

type FilesFolderContentProps = {
  files: FileObject[]
  folderName: string
}

export default function FilesFolderContent({
  files,
  folderName,
}: FilesFolderContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleCreateFolder = () => {
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Folder className="h-8 w-8 text-primary" />
            <Typography variant="h4" className="capitalize">
              {folderName}
            </Typography>
          </div>
          <Typography variant="muted">
            Manage files in the {folderName} folder.
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <FileUpload folder={folderName} />
          <CreateFolderButton onClick={handleCreateFolder} />
        </div>
      </div>

      <FileTable files={files} folderName={folderName} />

      <FolderSidebar
        bucketName="files"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}
