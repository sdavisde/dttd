'use client'

import { useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from './auth/session-provider'
import { permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'

type CreateFolderButtonProps = {
  bucketName: string
}

export function CreateFolderButton({ bucketName }: CreateFolderButtonProps) {
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useSession()

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setFolderName('')
    setError(null)
  }

  const handleCreate = async () => {
    try {
      permissionLock(['FILES_UPLOAD'])(user)

      if (!folderName.trim()) {
        setError('Folder name cannot be empty')
        return
      }

      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { error: createError } = await supabase.storage
        .from(bucketName)
        .upload(`${folderName}/.placeholder`, new Blob(['']), {
          cacheControl: '3600',
          upsert: false,
        })

      if (createError) {
        throw createError
      }

      // Refresh the page to show the new folder
      router.refresh()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the folder')
      logger.error('Error creating folder:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='contained'
        onClick={handleOpen}
        sx={{
          bgcolor: 'white',
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'grey.100',
          },
        }}
      >
        Create Folder
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Folder Name'
            type='text'
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant='contained'
            disabled={loading || !folderName.trim()}
          >
            Create
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
