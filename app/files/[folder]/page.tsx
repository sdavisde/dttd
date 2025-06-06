import { createClient } from '@/lib/supabase/server'
import { Box, Container, Paper, Typography, Button } from '@mui/material'
import { notFound } from 'next/navigation'
import { FileTable } from '@/app/files/[folder]/file-table'
import { FileObject } from '@supabase/storage-js'
import FolderIcon from '@mui/icons-material/Folder'
import { FileUpload } from '@/components/file-upload'
import { logger } from '@/lib/logger'
import { slugify } from '@/util/url'

async function getValidFolders() {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list()

  if (error) {
    throw error
  }

  return data
    .filter((item) => item.metadata === null)
    .map((folder) => ({
      name: folder.name,
      slug: slugify(folder.name),
    }))
}

export default async function FilesFolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder } = await params
  const validFolders = await getValidFolders()
  const availableSlugs = validFolders.map((folder) => folder.slug)
  const folderName = validFolders.find((f) => f.slug === folder)?.name

  if (!folderName) {
    logger.error(`Folder ${folder} not found in ${availableSlugs}`)
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list(folderName)

  if (error) {
    throw error
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: 'primary.light',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FolderIcon sx={{ fontSize: 40 }} />
            <Typography
              variant='h5'
              component='h1'
              sx={{ fontWeight: 'bold' }}
            >
              {folderName}
            </Typography>
          </Box>
          <FileUpload folder={folderName} />
        </Box>
      </Paper>

      <FileTable
        files={data as FileObject[]}
        folderName={folderName}
      />
    </Container>
  )
}
