'use client'

import { useState, useRef } from 'react'
import { UploadIcon, XIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from './auth/session-provider'
import { permissionLock } from '@/lib/security'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

type FileUploadProps = {
  folder: string
}

type UploadFile = {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string | null
  progress?: number
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp']

export function FileUpload({ folder }: FileUploadProps) {
  const [open, setOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useSession()

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF and image files are allowed'
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      permissionLock(['FILES_UPLOAD'])(user)

      const files = event.target.files
      if (!files || files.length === 0) return

      const newUploadFiles: UploadFile[] = []

      Array.from(files).forEach(file => {
        const error = validateFile(file)
        newUploadFiles.push({
          file,
          status: error ? 'error' : 'pending',
          error
        })
      })

      setUploadFiles(newUploadFiles)
      setOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Permission denied')
    }
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setUploading(true)

    const supabase = createClient()
    let successCount = 0

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i]
      if (uploadFile.status !== 'pending') continue

      try {
        // Update status to uploading
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ))

        const filePath = folder ? `${folder}/${uploadFile.file.name}` : uploadFile.file.name
        
        const { error: uploadError } = await supabase.storage.from('files').upload(filePath, uploadFile.file, {
          cacheControl: '3600',
          upsert: false,
        })

        if (uploadError) {
          throw uploadError
        }

        // Update status to success
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
        ))
        
        successCount++
      } catch (error) {
        // Update status to error
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ))
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`)
      // Small delay to show success state before refreshing
      setTimeout(() => {
        router.refresh()
        setOpen(false)
        setUploadFiles([])
      }, 1500)
    }
  }

  const hasValidFiles = uploadFiles.some(f => f.status === 'pending')
  const allCompleted = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'success' || f.status === 'error')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <UploadIcon className="w-4 h-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select multiple files to upload to {folder || 'root'}. Supported formats: PDF, JPG, PNG, GIF, WebP (max 10MB each)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploadFiles.length === 0 ? (
            <div className="text-center py-8">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept={ALLOWED_EXTENSIONS.join(',')}
                multiple
                style={{ display: 'none' }}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Select Files
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {uploadFiles.map((uploadFile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {uploadFile.file.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </div>
                      
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress || 0} className="mt-1" />
                      )}
                      
                      {uploadFile.error && (
                        <div className="text-sm text-destructive mt-1">
                          {uploadFile.error}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'success' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircleIcon className="w-5 h-5 text-destructive" />
                      )}
                      
                      {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  multiple
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Add More Files
                </Button>
              </div>
            </>
          )}

          {uploadFiles.some(f => f.status === 'error') && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Some files have validation errors. Please fix them before uploading.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
            {allCompleted ? 'Close' : 'Cancel'}
          </Button>
          
          {!allCompleted && (
            <Button 
              onClick={uploadAllFiles} 
              disabled={!hasValidFiles || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <UploadIcon className="w-4 h-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  Upload {uploadFiles.filter(f => f.status === 'pending').length} File{uploadFiles.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}