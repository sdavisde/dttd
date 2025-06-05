import { createClient } from '@/lib/supabase/server'
import { Typography } from '@mui/material'
import { notFound } from 'next/navigation'
import { FileTable } from '@/app/files/[folder]/file-table'
import { FileObject } from '@supabase/storage-js'

async function getValidFolders() {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list()

  if (error) {
    throw error
  }

  return data
    .filter((item) => item.metadata === null) // folders have null mimetype
    .map((folder) => folder.name) as string[]
}

export default async function FilesFolderPage({ params }: { params: { folder: string } }) {
  const folder = params.folder
  const VALID_FOLDERS = await getValidFolders()

  if (!VALID_FOLDERS.includes(folder)) {
    notFound()
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from('files').list(folder)

  if (error) {
    throw error
  }

  return (
    <div>
      <Typography
        variant='h4'
        component='h1'
        sx={{ mb: 4 }}
      >
        {folder
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Typography>

      <FileTable
        files={data as FileObject[]}
        folder={folder}
      />
    </div>
  )
}
