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
    <div>
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          <FileUpload folder={folderName} />
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
