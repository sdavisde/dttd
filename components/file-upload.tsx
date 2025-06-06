'use client'

import { useState, useRef } from 'react'
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from './auth/session-provider'
import { permissionLock } from '@/lib/security'

type FileUploadProps = {
  folder: string
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function FileUpload({ folder }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useSession()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      permissionLock(['FILES_UPLOAD'])(user)

      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('Only PDF and image files are allowed')
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setUploading(true)
      setError(null)

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage.from('files').upload(`${folder}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Refresh the page to show the new file
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading')
    } finally {
      setUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleUpload}
        accept={ALLOWED_FILE_TYPES.join(',')}
        style={{ display: 'none' }}
      />
      <Button
        variant='contained'
        startIcon={
          uploading ? (
            <CircularProgress
              size={20}
              color='inherit'
            />
          ) : (
            <UploadIcon />
          )
        }
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        sx={{
          bgcolor: 'white',
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'grey.100',
          },
        }}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>

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
