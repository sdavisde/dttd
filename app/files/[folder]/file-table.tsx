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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { logger } from '@/lib/logger'
import { permissionLock } from '@/lib/security'
import { useSession } from '@/components/auth/session-provider'

type FileTableProps = {
  files: FileObject[]
  folderName: string
}

export function FileTable({ files, folderName }: FileTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileObject | null>(null)
  const { user } = useSession()

  const handlePreview = async (file: FileObject) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('files').getPublicUrl(`${folderName}/${file.name}`)
    window.open(data.publicUrl, '_blank')
  }

  const handleDelete = async (file: FileObject) => {
    permissionLock(['FILES_DELETE'])(user)
    const supabase = createClient()
    const { error } = await supabase.storage.from('files').remove([`${folderName}/${file.name}`])
    if (error) {
      logger.error('Error deleting file:', error)
      return
    }
    // Refresh the page to update the file list
    window.location.reload()
  }

  return (
    <>
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
                  <Tooltip title='Delete'>
                    <IconButton
                      onClick={() => {
                        setFileToDelete(file)
                        setDeleteDialogOpen(true)
                      }}
                      color='error'
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (fileToDelete) {
                handleDelete(fileToDelete)
                setDeleteDialogOpen(false)
              }
            }}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
