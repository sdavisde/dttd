'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import { FileObject } from '@supabase/storage-js'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2 } from 'lucide-react'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useSession } from '@/components/auth/session-provider'

type DeleteFileButtonProps = {
  file: FileObject
  folderName: string
  totalFiles: number
}

export function DeleteFileButton({ file, folderName, totalFiles }: DeleteFileButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useSession()

  const handleDelete = async () => {
    try {
      permissionLock(['FILES_DELETE'])(user)

      // Check if this is the last file
      if (totalFiles === 1) {
        return // Dialog will handle displaying this constraint
      }

      setIsDeleting(true)
      const supabase = createClient()
      const { error } = await supabase.storage.from('files').remove([`${folderName}/${file.name}`])
      
      if (error) {
        logger.error('Error deleting file:', error)
        alert('Failed to delete file')
        return
      }
      
      // Refresh the page to update the file list
      window.location.reload()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the file'
      alert(errorMessage)
      logger.error('Error deleting file:', err)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const isDisabled = totalFiles === 1

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDisabled}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete file</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDisabled ? 'Cannot delete the last file' : 'Delete'}
        </TooltipContent>
      </Tooltip>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete File"
        itemName={file.name}
        isDeleting={isDeleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        confirmText="Delete File"
      />
    </TooltipProvider>
  )
}
