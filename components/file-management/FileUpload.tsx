'use client'

import { useState, useRef } from 'react'
import { isNil } from 'lodash'
import { useRouter } from 'next/navigation'
import { Button, type ButtonProps } from '@/components/ui/button'
import { ALLOWED_FILE_TYPES } from '@/lib/files/constants'
import { uploadFileAction } from '@/services/files/actions'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { toastError } from '@/lib/toast-error'

type FileUploadProps = {
  folder: string
  buttonText?: string
  buttonVariant?: ButtonProps['variant']
}

export function FileUpload({
  folder,
  buttonText = 'Upload File',
  buttonVariant = 'ghost',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files
      if (isNil(files) || files.length === 0) return

      const file = files[0]

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error('Only PDF and image files are allowed')
        return
      }

      // Validate file size (10MB limit) REMOVED THIS LIMIT B/C OF ROSTER PDFS
      // if (file.size > 10 * 1024 * 1024) {
      //   toast.error('File size must be less than 10MB')
      //   return
      // }

      setUploading(true)

      const formData = new FormData()
      formData.set('folder', folder)
      formData.set('file', file)

      const result = await uploadFileAction(formData)

      if (result.error !== undefined) {
        throw new Error(result.error)
      }

      toast.success(`File "${file.name}" uploaded successfully`)

      // Refresh the page to show the new file
      router.refresh()
    } catch (err) {
      toastError('Failed to upload file. Please try again.', { error: err })
    } finally {
      setUploading(false)
      // Reset the file input
      if (!isNil(fileInputRef.current)) {
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
        variant={buttonVariant}
        className="flex items-center gap-2"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {buttonText}
      </Button>
    </>
  )
}
