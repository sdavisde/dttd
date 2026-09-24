import { FolderOpen } from 'lucide-react'
import { Results } from '@/lib/results'
import { getRootFolders } from '@/services/files/file-service'

/** Shown on /files before a folder is picked from the rail. */
export default async function DocumentsRootPage() {
  const hasFolders = Results.unwrapOr(await getRootFolders(), []).length > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-md border border-dashed bg-card px-6 py-16 text-center">
      <FolderOpen className="mb-4 size-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-medium text-foreground">
        {hasFolders ? 'Pick a folder to get started' : 'No documents yet'}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFolders
          ? 'Choose a folder to see its files.'
          : 'Nothing has been shared with the community yet. Check back soon.'}
      </p>
    </div>
  )
}
