'use client'

import { useState } from 'react'
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { createClient } from '@/lib/supabase/client'
import { useSession } from './auth/session-provider'
import { permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import { FileObject } from '@supabase/storage-js'

type DeleteFileButtonProps = {
  file: FileObject
  folderName: string
  totalFiles: number
}

export function DeleteFileButton({ file, folderName, totalFiles }: DeleteFileButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSession()

  const handleDelete = async () => {
    try {
      permissionLock(['FILES_DELETE'])(user)

      // Check if this is the last file
      if (totalFiles === 1) {
        setError('Cannot delete the last file in a folder')
        return
      }

      const supabase = createClient()
      const { error } = await supabase.storage.from('files').remove([`${folderName}/${file.name}`])
      if (error) {
        logger.error('Error deleting file:', error)
        setError('Failed to delete file')
        return
      }
      // Refresh the page to update the file list
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the file')
      logger.error('Error deleting file:', err)
    }
  }

  return (
    <>
      <Tooltip title={totalFiles === 1 ? 'Cannot delete the last file' : 'Delete'}>
        <span>
          <IconButton
            onClick={() => setDeleteDialogOpen(true)}
            color='error'
            disabled={totalFiles === 1}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>Are you sure you want to delete "{file.name}"? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDelete()
              setDeleteDialogOpen(false)
            }}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity='error'
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}
