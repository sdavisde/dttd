'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/auth/session-provider'
import { permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'

interface FolderSidebarProps {
  bucketName: string
  isOpen: boolean
  onClose: () => void
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

export function FolderSidebar({
  bucketName,
  isOpen,
  onClose,
}: FolderSidebarProps) {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useSession()

  // Reset form when sidebar opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null)
    } else {
      setFolderName('')
      setError(null)
    }
  }, [isOpen])

  const handleCreate = async () => {
    try {
      permissionLock(['FILES_UPLOAD'])(user)

      if (!folderName.trim()) {
        setError('Folder name cannot be empty')
        return
      }

      // Validate folder name (no special characters except spaces, dashes, underscores)
      const sanitizedName = folderName.trim()
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitizedName)) {
        setError(
          'Folder name can only contain letters, numbers, spaces, dashes, and underscores'
        )
        return
      }

      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { error: createError } = await supabase.storage
        .from(bucketName)
        .upload(`${sanitizedName}/.placeholder`, new Blob(['']), {
          cacheControl: '3600',
          upsert: false,
        })

      if (createError) {
        if (createError.message.includes('already exists')) {
          setError('A folder with this name already exists')
        } else {
          throw createError
        }
        return
      }

      // Refresh the page to show the new folder
      router.refresh()
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the folder'
      setError(errorMessage)
      logger.error('Error creating folder:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasValidName = folderName.trim().length > 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Folder</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <div className="space-y-2">
            <Typography variant="muted" className="text-sm font-bold">
              Folder Details
            </Typography>
            <div className="bg-muted/20 rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  autoFocus
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  disabled={loading}
                  placeholder="Enter folder name"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && hasValidName && handleCreate()
                  }
                />
                <Typography variant="muted" className="text-xs">
                  Only letters, numbers, spaces, dashes, and underscores are
                  allowed
                </Typography>
              </div>

              <div className="space-y-2">
                <Typography
                  variant="muted"
                  className="text-xs uppercase tracking-wide font-medium"
                >
                  Bucket
                </Typography>
                <Typography className="text-sm capitalize font-medium">
                  {bucketName}
                </Typography>
              </div>

              <div className="space-y-2">
                <Typography
                  variant="muted"
                  className="text-xs uppercase tracking-wide font-medium"
                >
                  Supported File Types
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {['PDF', 'JPEG', 'PNG', 'GIF', 'WebP'].map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !hasValidName}>
            {loading ? 'Creating...' : 'Create Folder'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
