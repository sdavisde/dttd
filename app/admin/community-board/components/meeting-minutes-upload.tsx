'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { Permission, permissionLock } from '@/lib/security'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Loader2, FileText, X } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useSession()

  const resetState = () => {
    setLocation('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only PDF and image files are allowed')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      permissionLock([Permission.FILES_UPLOAD])(user)

      setUploading(true)

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(
          `${MEETING_MINUTES_FOLDER}/${selectedFile.name}`,
          selectedFile,
          {
            cacheControl: '3600',
            upsert: false,
            metadata: location.trim()
              ? { location: location.trim() }
              : undefined,
          }
        )

      if (uploadError) {
        throw uploadError
      }

      toast.success(`File "${selectedFile.name}" uploaded successfully`)
      handleOpenChange(false)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'An error occurred while uploading'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Add Minutes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Meeting Minutes</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleUpload()
          }}
        >
          <div className="space-y-2">
            <Label>File</Label>
            {selectedFile ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelected}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  style={{ display: 'none' }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="e.g. First Baptist Church, Dallas"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={uploading}
            />
          </div>
          <Button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
