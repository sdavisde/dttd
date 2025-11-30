'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileObject } from '@supabase/storage-js'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Download, FileText } from 'lucide-react'
import { DeleteFileButton } from './DeleteFileButton'
import { toast } from 'sonner'

type FileTableProps = {
  files: FileObject[]
  folderName: string
}

export function FileTable({ files: initialFiles, folderName }: FileTableProps) {
  const [files, setFiles] = useState<FileObject[]>(initialFiles)

  // Update files when initialFiles prop changes (e.g., after upload)
  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  const handlePreview = async (file: FileObject) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('files').getPublicUrl(`${folderName}/${file.name}`)
    window.open(data.publicUrl, '_blank')
  }

  const handleDeleteFile = (deletedFile: FileObject) => {
    // Remove the file from the local state immediately for responsive UI
    setFiles(prevFiles => prevFiles.filter(file => file.name !== deletedFile.name))
    
    // Show success toast
    toast.success(`File "${deletedFile.name}" deleted successfully`)
  }

  const handleDownload = async (file: FileObject) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('files')
      .download(`${folderName}/${file.name}`)
    if (error) {
      logger.error(`Error downloading file: ${error.message}`)
      return
    }
    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No files found in this folder.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold min-w-[200px]">
                File Name
              </TableHead>
              <TableHead className="min-w-[100px]">Size</TableHead>
              <TableHead className="min-w-[150px]">Last Modified</TableHead>
              <TableHead className="sticky right-0 bg-background text-right min-w-[120px] border-l">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, index) => (
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
                  {file.metadata?.size 
                    ? `${(file.metadata.size / 1024).toFixed(1)} KB`
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {file.updated_at 
                    ? new Date(file.updated_at).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell className="sticky right-0 bg-background text-right border-l">
                  <div onClick={(e) => e.stopPropagation()}>
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
                      folderName={folderName}
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
  )
}
