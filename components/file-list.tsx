'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FolderIcon,
  FileIcon,
  DownloadIcon,
  MoreVerticalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileContextMenu } from './file-context-menu'

type FileSystemItem = {
  name: string
  isFolder: boolean
  size?: number
  updated_at?: string
  metadata?: any
}

type FileListProps = {
  items: FileSystemItem[]
  currentBucket: string
  currentPath: string
}

export function FileList({ items, currentBucket, currentPath }: FileListProps) {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    item: FileSystemItem
  } | null>(null)

  const handleContextMenu = (event: React.MouseEvent, item: FileSystemItem) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            item,
          }
        : null
    )
  }

  const handleClose = () => {
    setContextMenu(null)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg font-medium">This folder is empty</div>
            <div className="text-sm">
              Upload files or create folders to get started
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {item.isFolder ? (
                  <FolderIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileIcon className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* File/Folder Info - Clickable for folders */}
              <div className="flex-1 min-w-0">
                {item.isFolder ? (
                  <Link
                    href={`/admin/files/${currentPath ? `${currentPath}/${item.name}` : item.name}`}
                    className="block hover:text-primary"
                  >
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground">Folder</div>
                  </Link>
                ) : (
                  <div>
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(item.size)} •{' '}
                      {formatDate(item.updated_at)}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!item.isFolder && (
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a
                      href={`/api/files/download?bucket=${currentBucket}&path=${currentPath ? `${currentPath}/${item.name}` : item.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Download file"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </a>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleContextMenu(e, item)
                  }}
                  title="More options"
                >
                  <MoreVerticalIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <FileContextMenu
        anchorEl={
          contextMenu
            ? ({
                getBoundingClientRect: () => ({
                  top: contextMenu.mouseY,
                  left: contextMenu.mouseX,
                  right: contextMenu.mouseX,
                  bottom: contextMenu.mouseY,
                  width: 0,
                  height: 0,
                  x: contextMenu.mouseX,
                  y: contextMenu.mouseY,
                  toJSON: () => {},
                }),
              } as HTMLElement)
            : null
        }
        open={contextMenu !== null}
        onClose={handleClose}
        item={contextMenu?.item ?? { name: '', isFolder: false }}
        bucket={currentBucket}
        currentPath={currentPath}
      />
    </>
  )
}
