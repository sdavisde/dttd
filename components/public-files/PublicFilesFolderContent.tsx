'use client'

import { FileObject } from '@supabase/storage-js'
import { PublicFileTable } from './PublicFileTable'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'

type PublicFilesFolderContentProps = {
  files: FileObject[]
  folderName: string
}

export function PublicFilesFolderContent({
  files,
  folderName,
}: PublicFilesFolderContentProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Typography variant="muted">
            This folder is currently empty.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Typography variant="small" className="text-muted-foreground">
        {files.length} item{files.length !== 1 ? 's' : ''}
      </Typography>
      
      <PublicFileTable files={files} folderName={folderName} />
    </div>
  )
}