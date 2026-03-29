'use client'

import { useEffect, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FileObject } from '@supabase/storage-js'
import { isOk } from '@/lib/results'
import {
  getFilePublicUrlAction,
  getFileDownloadUrlAction,
} from '@/services/files/actions'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { DeleteFileButton } from './DeleteFileButton'
import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import '@/components/ui/data-table/types'

type SortableFileTableProps = {
  files: FileObject[]
  folderName: string
  onFileClickAction?: (file: FileObject) => void
  emptyMessage?: string
}

export function SortableFileTable({
  files: initialFiles,
  folderName,
  onFileClickAction,
  emptyMessage = 'No files found in this folder.',
}: SortableFileTableProps) {
  const [files, setFiles] = useState<FileObject[]>(initialFiles)

  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  const handlePreview = async (file: FileObject) => {
    const result = await getFilePublicUrlAction(folderName, file.name)
    if (isOk(result)) {
      window.open(result.data.publicUrl, '_blank')
    } else {
      toast.error('Failed to preview file')
    }
  }

  const handleRowClick = (file: FileObject) => {
    if (onFileClickAction !== undefined) {
      onFileClickAction(file)
      return
    }

    handlePreview(file)
  }

  const handleDeleteFile = (deletedFile: FileObject) => {
    setFiles((previousFiles) =>
      previousFiles.filter((file) => file.name !== deletedFile.name)
    )
    toast.success(`File "${deletedFile.name}" deleted successfully`)
  }

  const handleDownload = async (file: FileObject) => {
    const result = await getFileDownloadUrlAction(folderName, file.name)
    if (isOk(result)) {
      const a = document.createElement('a')
      a.href = result.data.downloadUrl
      a.download = file.name
      a.click()
    } else {
      toast.error('Failed to download file')
    }
  }

  const columns: ColumnDef<FileObject>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'File Name',
        mobilePriority: 'primary',
      },
    },
    {
      id: 'size',
      accessorFn: (file) => file.metadata?.size ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ row }) =>
        row.original.metadata?.size !== undefined
          ? `${(row.original.metadata.size / 1024).toFixed(1)} KB`
          : '-',
      meta: {
        showOnMobile: true,
        mobileLabel: 'Size',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'updatedAt',
      accessorFn: (file) => file.updated_at ?? '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Modified" />
      ),
      cell: ({ row }) =>
        row.original.updated_at !== undefined &&
        row.original.updated_at !== null &&
        row.original.updated_at !== ''
          ? new Date(row.original.updated_at).toLocaleDateString()
          : '-',
      meta: {
        showOnMobile: true,
        mobileLabel: 'Last Modified',
        mobilePriority: 'secondary',
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div
          className="flex justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(row.original)}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download file</span>
          </Button>
          <DeleteFileButton
            file={row.original}
            folderName={folderName}
            totalFiles={files.length}
            onDelete={handleDeleteFile}
          />
        </div>
      ),
      enableSorting: false,
      meta: {
        showOnMobile: false,
      },
    },
  ]

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={files}
      user={null}
      initialSort={[{ id: 'updatedAt', desc: true }]}
      searchPlaceholder="Search files by name"
      onRowClick={handleRowClick}
      emptyState={{
        noData: emptyMessage,
        noResults: 'No files match your search.',
      }}
    />
  )
}
