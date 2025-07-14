import { createClient } from '@/lib/supabase/server'
import { Box, Container, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Link } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import { logger } from '@/lib/logger'
import { slugify } from '@/util/url'
import { CreateFolderButton } from '@/components/create-folder-button'
import { getStorageUsage } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'

async function getBuckets() {
  const supabase = await createClient()
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    logger.error('Error fetching buckets:', bucketsError)
    return []
  }

  const bucketsWithFolders = await Promise.all(
    buckets.map(async (bucket) => {
      const { data: folders, error: foldersError } = await supabase.storage.from(bucket.name).list()

      if (foldersError) {
        logger.error(`Error fetching folders for bucket ${bucket.name}:`, foldersError)
        return { name: bucket.name, folders: [] }
      }

      return {
        name: bucket.name,
        folders: folders
          .filter((item) => item.metadata === null) // folders have null mimetype
          .map((folder) => ({
            name: folder.name,
            slug: slugify(folder.name),
          })),
      }
    })
  )

  return bucketsWithFolders
}

export default async function FilesPage() {
  const buckets = await getBuckets()
  const usedBytes = await getStorageUsage()
  const totalBytes = 1024 * 1024 * 1024 // 1 GB in bytes

  if (buckets.length === 0) {
    return (
      <Container
        maxWidth='lg'
        sx={{ py: 4 }}
      >
        <Paper
          elevation={0}
          sx={{ p: 4, textAlign: 'center' }}
        >
          <Typography
            variant='h5'
            component='h1'
            gutterBottom
          >
            No Files Available
          </Typography>
          <Typography color='text.secondary'>There are no files or folders available at this time.</Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <div className='mb-4'>
        <StorageUsage
          usedBytes={usedBytes}
          totalBytes={totalBytes}
        />
      </div>
      {buckets.map((bucket) => (
        <Paper
          key={bucket.name}
          elevation={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ p: 2, backgroundColor: 'primary.light', color: 'white', borderRadius: '4px 4px 0 0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant='h6'
                component='h2'
                sx={{ textTransform: 'capitalize' }}
              >
                {bucket.name}
              </Typography>
              <CreateFolderButton bucketName={bucket.name} />
            </Box>
          </Box>
          <List>
            {bucket.folders.map((folder) => (
              <ListItem
                key={folder.slug}
                component={Link}
                href={`/admin/files/${folder.slug}`}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText
                  primary={folder.name}
                  slotProps={{
                    primary: {
                      sx: { textTransform: 'capitalize' },
                    },
                  }}
                />
              </ListItem>
            ))}
            {bucket.folders.length === 0 && (
              <ListItem>
                <ListItemText
                  primary='No folders available'
                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      ))}
    </Container>
  )
}
