'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileObject } from '@supabase/storage-js'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import { logger } from '@/lib/logger'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteFileButton } from '@/components/file-management/DeleteFileButton'
import {
  Download,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { toast } from 'sonner'

type SortField = 'name' | 'created_at'
type SortDirection = 'asc' | 'desc'

type MeetingMinutesTableProps = {
  files: FileObject[]
}

export function MeetingMinutesTable({
  files: initialFiles,
}: MeetingMinutesTableProps) {
  const [files, setFiles] = useState<FileObject[]>(initialFiles)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'created_at':
        comparison =
          new Date(a.created_at ?? 0).getTime() -
          new Date(b.created_at ?? 0).getTime()
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const handlePreviewAndDownload = async (file: FileObject) => {
    const supabase = createClient()

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(`${MEETING_MINUTES_FOLDER}/${file.name}`)

    window.open(publicUrlData.publicUrl, '_blank')

    const { data, error } = await supabase.storage
      .from('files')
      .download(`${MEETING_MINUTES_FOLDER}/${file.name}`)

    if (error) {
      logger.error(`Error downloading file: ${error.message}`)
      toast.error('Failed to download file')
      return
    }

    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownload = async (file: FileObject) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('files')
      .download(`${MEETING_MINUTES_FOLDER}/${file.name}`)

    if (error) {
      logger.error(`Error downloading file: ${error.message}`)
      toast.error('Failed to download file')
      return
    }

    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteFile = (deletedFile: FileObject) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== deletedFile.name)
    )
    toast.success(`File "${deletedFile.name}" deleted successfully`)
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No meeting minutes found. Upload your first file to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    File Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Date Uploaded
                    {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="sticky right-0 bg-background text-right min-w-[120px] border-l">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFiles.map((file, index) => (
                <TableRow
                  key={file.name}
                  className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                  onClick={() => handlePreviewAndDownload(file)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {file.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.created_at
                      ? new Date(file.created_at).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-background text-right border-l">
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download file</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DeleteFileButton
                        file={file}
                        folderName={MEETING_MINUTES_FOLDER}
                        totalFiles={files.length}
                        onDelete={handleDeleteFile}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {sortedFiles.map((file) => (
          <div
            key={file.name}
            className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer"
            onClick={() => handlePreviewAndDownload(file)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-gray-500 shrink-0" />
                <span className="font-medium text-lg truncate">
                  {file.name}
                </span>
              </div>
              <div
                className="flex gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <DeleteFileButton
                  file={file}
                  folderName={MEETING_MINUTES_FOLDER}
                  totalFiles={files.length}
                  onDelete={handleDeleteFile}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span>
                {file.created_at
                  ? new Date(file.created_at).toLocaleDateString()
                  : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
