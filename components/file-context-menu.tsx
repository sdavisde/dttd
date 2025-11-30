'use client'

import { useState } from 'react'
import {
  DownloadIcon,
  TrashIcon,
  EditIcon,
  FolderIcon,
  FileIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSession } from './auth/session-provider'
import { Permission, permissionLock } from '@/lib/security'
import { logger } from '@/lib/logger'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

type FileContextMenuProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  item: {
    name: string
    isFolder: boolean
  }
  bucket: string
  currentPath: string
}

export function FileContextMenu({
  anchorEl,
  open,
  onClose,
  item,
  bucket,
  currentPath,
}: FileContextMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [newName, setNewName] = useState(item.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useSession()

  const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name

  const handleDownload = () => {
    if (!item.isFolder) {
      window.open(
        `/api/files/download?bucket=${bucket}&path=${fullPath}`,
        '_blank'
      )
    }
    onClose()
  }

  const handleRename = async () => {
    try {
      permissionLock([Permission.FILES_UPLOAD])(user)

      if (!newName.trim() || newName === item.name) {
        setError('Please enter a valid new name')
        return
      }

      setLoading(true)
      setError(null)

      const supabase = createClient()
      const newPath = currentPath ? `${currentPath}/${newName}` : newName

      if (item.isFolder) {
        // For folders, we need to move all files within the folder
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list(fullPath)

        if (listError) throw listError

        // Move each file to the new folder path
        for (const file of files) {
          const oldFilePath = `${fullPath}/${file.name}`
          const newFilePath = `${newPath}/${file.name}`

          const { error: moveError } = await supabase.storage
            .from(bucket)
            .move(oldFilePath, newFilePath)

          if (moveError) throw moveError
        }
      } else {
        // For files, simple move operation
        const { error: moveError } = await supabase.storage
          .from(bucket)
          .move(fullPath, newPath)

        if (moveError) throw moveError
      }

      router.refresh()
      setRenameOpen(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename item')
      logger.error(`Error renaming item: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      permissionLock([Permission.FILES_DELETE])(user)

      setLoading(true)
      setError(null)

      const supabase = createClient()

      if (item.isFolder) {
        // For folders, we need to delete all files within the folder first
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list(fullPath)

        if (listError) throw listError

        // Delete all files in the folder
        const filesToDelete = files.map((file) => `${fullPath}/${file.name}`)
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(filesToDelete)

          if (deleteError) throw deleteError
        }
      } else {
        // For files, simple delete operation
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([fullPath])

        if (deleteError) throw deleteError
      }

      router.refresh()
      setDeleteOpen(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      logger.error(`Error deleting item: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // For the context menu, we'll use a simple dropdown positioned at the cursor
  const menuStyle = anchorEl
    ? {
        position: 'fixed' as const,
        top: anchorEl.getBoundingClientRect().top,
        left: anchorEl.getBoundingClientRect().left,
        zIndex: 50,
      }
    : {}

  return (
    <>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Context Menu */}
          <div
            className="fixed z-50 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={menuStyle}
          >
            {!item.isFolder && (
              <button
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleDownload}
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </button>
            )}

            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setRenameOpen(true)
                onClose()
              }}
            >
              <EditIcon className="w-4 h-4" />
              Rename
            </button>

            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                setDeleteOpen(true)
                onClose()
              }}
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {item.isFolder ? (
                <FolderIcon className="w-5 h-5" />
              ) : (
                <FileIcon className="w-5 h-5" />
              )}
              Rename {item.isFolder ? 'Folder' : 'File'}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{item.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newName">New name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={loading}
                placeholder="Enter new name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={loading || !newName.trim()}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <TrashIcon className="w-5 h-5" />
              Delete {item.isFolder ? 'Folder' : 'File'}
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                Are you sure you want to delete "{item.name}"?
                {item.isFolder &&
                  ' All files within this folder will also be deleted.'}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
