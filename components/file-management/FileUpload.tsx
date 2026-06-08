'use client'

import { useState, useRef } from 'react'
import { isNil } from 'lodash'
import { useRouter } from 'next/navigation'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  ALLOWED_FILE_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
} from '@/lib/files/constants'
import { uploadFileToStorage } from '@/lib/files/upload-client'
import {
  formatFileSize,
  getFriendlyUploadError,
} from '@/lib/files/upload-errors'
import { isErr } from '@/lib/results'
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
        toast.error(
          `"${file.name}" isn't a supported file type. Please upload a PDF or image file.`
        )
        return
      }

      // Friendly size guard (bytes go directly to Supabase Storage)
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast.error(
          `"${file.name}" is ${formatFileSize(file.size)}, which exceeds the ${MAX_UPLOAD_SIZE_LABEL} limit.`
        )
        return
      }

      setUploading(true)

      const result = await uploadFileToStorage({ folder, file })

      if (isErr(result)) {
        // uploadFileToStorage already logged the raw cause; show the user the
        // specific reason it returned.
        toast.error(result.error)
        return
      }

      toast.success(`File "${file.name}" uploaded successfully`)

      // Refresh the page to show the new file
      router.refresh()
    } catch (err) {
      toastError(getFriendlyUploadError(err), { error: err })
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
