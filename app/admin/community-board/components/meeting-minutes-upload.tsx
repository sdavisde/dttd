'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { Permission, permissionLock } from '@/lib/security'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

export function MeetingMinutesUpload() {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useSession()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      permissionLock([Permission.FILES_UPLOAD])(user)

      const files = event.target.files
      if (!files || files.length === 0) return

      const file = files[0]

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error('Only PDF and image files are allowed')
        return
      }

      setUploading(true)

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(`${MEETING_MINUTES_FOLDER}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      toast.success(`File "${file.name}" uploaded successfully`)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while uploading'
      )
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
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
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Add Minutes
      </Button>
    </>
  )
}
