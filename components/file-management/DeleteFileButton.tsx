'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Permission, permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import { FileObject } from '@supabase/storage-js'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Trash2 } from 'lucide-react'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useSession } from '@/components/auth/session-provider'
import { toast } from 'sonner'

type DeleteFileButtonProps = {
  file: FileObject
  folderName: string
  totalFiles: number
  onDelete?: (file: FileObject) => void
}

export function DeleteFileButton({
  file,
  folderName,
  totalFiles,
  onDelete,
}: DeleteFileButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useSession()

  const handleDelete = async () => {
    try {
      permissionLock([Permission.FILES_DELETE])(user)

      // Check if this is the last file
      if (totalFiles === 1) {
        toast.error('Cannot delete the last file in a folder')
        return
      }

      setIsDeleting(true)

      // Delete the file from backend immediately after confirmation
      const supabase = createClient()
      const { error } = await supabase.storage
        .from('files')
        .remove([`${folderName}/${file.name}`])

      if (error) {
        logger.error(`Error deleting file: ${error.message}`)
        toast.error('Failed to delete file')
        return
      }

      // Call onDelete callback to update local state for responsive UI
      if (onDelete) {
        onDelete(file)
      } else {
        // Fallback - reload page if no callback provided
        window.location.reload()
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting the file'
      toast.error(errorMessage)
      logger.error(
        `Error deleting file: ${err instanceof Error ? err.message : String(err)}`
      )
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
