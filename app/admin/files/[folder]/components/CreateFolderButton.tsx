'use client'

import { Button } from '@/components/ui/button'
import { FolderPlus } from 'lucide-react'

type CreateFolderButtonProps = {
  onClick: () => void
}

export function CreateFolderButton({ onClick }: CreateFolderButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <FolderPlus className="h-4 w-4" />
      Create Folder
    </Button>
  )
}
