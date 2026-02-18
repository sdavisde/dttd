'use client'

import { createClient } from '@/lib/supabase/client'
import { FileObject } from '@supabase/storage-js'
import {
  MeetingMinuteFile,
  PagedMeetingMinuteFiles,
  StorageSortField,
} from '@/lib/files/types'
import { getMeetingMinutesPageAction } from '@/services/files/actions'
import { MEETING_MINUTES_FOLDER } from '@/lib/files/constants'
import { logger } from '@/lib/logger'
import { useServerPagination } from '@/hooks/use-server-pagination'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

type MeetingMinutesTableProps = {
  initialPageData: PagedMeetingMinuteFiles
}

export function MeetingMinutesTable({
  initialPageData,
}: MeetingMinutesTableProps) {
  const {
    currentPage,
    sortField,
    sortDirection,
    currentPageItems,
    isPageLoading,
    error,
    hasPreviousPage,
    hasNextPage,
    nextPage,
    previousPage,
    toggleSort,
    removeItemFromCache,
  } = useServerPagination<MeetingMinuteFile, StorageSortField>({
    initialPageData,
    fetchPage: getMeetingMinutesPageAction,
  })

  const getSortIcon = (field: StorageSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const handlePreview = (file: MeetingMinuteFile) => {
    const supabase = createClient()

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(`${MEETING_MINUTES_FOLDER}/${file.name}`)

    window.open(publicUrlData.publicUrl, '_blank')
  }

  const handleDownload = async (file: MeetingMinuteFile) => {
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
    removeItemFromCache((file) => file.name === deletedFile.name)
    toast.success(`File "${deletedFile.name}" deleted successfully`)
  }

  if (currentPageItems.length === 0 && !isPageLoading) {
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
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('name')}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                    disabled={isPageLoading}
                  >
                    File Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort('created_at')}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                    disabled={isPageLoading}
                  >
                    Date Uploaded
                    {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">Location</TableHead>
                <TableHead className="sticky right-0 bg-background text-right min-w-[120px] border-l">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageItems.map((file, index) => (
                <TableRow
                  key={file.name}
                  className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                  onClick={() => handlePreview(file)}
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
                  <TableCell className="text-muted-foreground">
                    {file.location ?? '-'}
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
                        totalFiles={currentPageItems.length}
                        onDelete={handleDeleteFile}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {currentPage}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage || isPageLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage || isPageLoading}
            >
              {isPageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {currentPageItems.map((file) => (
          <div
            key={file.name}
            className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer"
            onClick={() => handlePreview(file)}
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
                  totalFiles={currentPageItems.length}
                  onDelete={handleDeleteFile}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                {file.created_at
                  ? new Date(file.created_at).toLocaleDateString()
                  : '-'}
              </div>
              {file.location && <div>{file.location}</div>}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>Page {currentPage}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={!hasPreviousPage || isPageLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage || isPageLoading}
            >
              {isPageLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
