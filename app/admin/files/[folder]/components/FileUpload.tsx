'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { permissionLock } from '@/lib/security'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type FileUploadProps = {
  folder: string
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

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
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(`${folder}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Refresh the page to show the new file
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while uploading'
      )
    } finally {
      setUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept={ALLOWED_FILE_TYPES.join(',')}
        style={{ display: 'none' }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
