'use client'

import { useState } from 'react'
import { FolderPlusIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from './auth/session-provider'
import { permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

type CreateFolderButtonProps = {
  bucketName: string
  currentPath?: string
}

export function CreateFolderButton({ bucketName, currentPath = '' }: CreateFolderButtonProps) {
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useSession()

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
      const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName
      const { error: createError } = await supabase.storage
        .from(bucketName)
        .upload(`${folderPath}/.placeholder`, new Blob(['']), {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <FolderPlusIcon className="w-4 h-4" />
          Create Folder
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for the new folder in {currentPath || 'root'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              disabled={loading}
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && folderName.trim()) {
                  handleCreate()
                }
              }}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !folderName.trim()}>
            {loading ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}