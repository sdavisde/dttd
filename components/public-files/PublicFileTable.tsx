'use client'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Download, FileText, FolderOpen, Folder } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/url'

type PublicFileTableProps = {
  files: FileObject[]
  folderName: string
}

export function PublicFileTable({ files, folderName }: PublicFileTableProps) {
  const handlePreview = async (file: FileObject) => {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('files')
      .getPublicUrl(`${folderName}/${file.name}`)
    window.open(data.publicUrl, '_blank')
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

  // Separate folders and files
  const folders = files.filter((item) => item.metadata === null)
  const actualFiles = files.filter((item) => item.metadata !== null)

  return (
    <div className="space-y-6">
      {/* Folders section */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Folders</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Folder Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.name}>
                  <TableCell>
                    <Link
                      href={`/files/${folderName}/${slugify(folder.name)}`}
                      className="flex items-center gap-3 hover:bg-muted/50 transition-colors p-2 -m-2 rounded"
                    >
                      <Folder className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{folder.name}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Files section */}
      {actualFiles.length > 0 && (
        <div>
          {folders.length > 0 && (
            <h3 className="text-lg font-semibold mb-3">Files</h3>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold min-w-[200px]">
                    File Name
                  </TableHead>
                  <TableHead className="min-w-[100px]">Size</TableHead>
                  <TableHead className="min-w-[150px]">Last Modified</TableHead>
                  <TableHead className="text-right min-w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actualFiles.map((file, index) => (
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
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {file.updated_at
                        ? new Date(file.updated_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
