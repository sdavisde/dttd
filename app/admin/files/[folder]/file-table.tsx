'use client'

import { createClient } from '@/lib/supabase/client'
import { FileObject } from '@supabase/storage-js'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { logger } from '@/lib/logger'
import { DeleteFileButton } from '@/components/delete-file-button'

type FileTableProps = {
  files: FileObject[]
  folderName: string
}

export function FileTable({ files, folderName }: FileTableProps) {
  const handlePreview = async (file: FileObject) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('files').getPublicUrl(`${folderName}/${file.name}`)
    window.open(data.publicUrl, '_blank')
  }

  return (
    <TableContainer
      component={Paper}
      elevation={2}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Name</TableCell>
            <TableCell
              align='right'
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.name}
              hover
              onClick={() => handlePreview(file)}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <TableCell
                component='th'
                scope='row'
              >
                {file.name}
              </TableCell>
              <TableCell
                align='right'
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip title='Download'>
                  <IconButton
                    onClick={async () => {
                      const supabase = createClient()
                      const { data, error } = await supabase.storage
                        .from('files')
                        .download(`${folderName}/${file.name}`)
                      if (error) {
                        logger.error('Error downloading file:', error)
                        return
                      }
                      const url = window.URL.createObjectURL(data)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = file.name
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}
                    color='primary'
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <DeleteFileButton
                  file={file}
                  folderName={folderName}
                  totalFiles={files.length}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
