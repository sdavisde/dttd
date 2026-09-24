import { Suspense } from 'react'
import { FolderOpen } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateFolderDialog } from '@/components/file-management/CreateFolderDialog'
import { FileBrowserTable } from '@/components/file-management/FileBrowserTable'
import { FileUpload } from '@/components/file-management/FileUpload'
import { FolderRail } from '@/components/file-management/FolderRail'
import {
  adminFilesHref,
  describeFolderContents,
  type RootFolder,
} from '@/lib/files/browser'
import { logger } from '@/lib/logger'
import { isErr, Results } from '@/lib/results'
import { getFolderView, getRootFolders } from '@/services/files/file-service'
import { getLoggedInUser } from '@/services/identity/user'
import { StorageMeter } from './storage-meter'

type FilesPageProps = {
  /** URL slugs below /admin/files; empty when no folder is open */
  pathSegments: string[]
}

/**
 * The whole admin Files experience, shared by the root and nested routes so
 * the header and folder rail stay put at every depth.
 */
export async function FilesPage({ pathSegments }: FilesPageProps) {
  const isRoot = pathSegments.length === 0
  const [userResult, viewResult, rootFoldersResult] = await Promise.all([
    getLoggedInUser(),
    isRoot ? null : getFolderView(pathSegments),
    getRootFolders(),
  ])

  if (isErr(userResult) || isNil(userResult.data)) {
    redirect('/')
  }

  if (!isNil(viewResult) && isErr(viewResult)) {
    logger.error({ error: viewResult.error }, 'Unable to load admin files')
    notFound()
  }

  const view = viewResult?.data ?? null
  const storagePath = view?.storagePath ?? ''
  const trail = view?.trail ?? []
  const rootFolders = Results.unwrapOr(rootFoldersResult, [])
  const folderLabel = trail.at(-1)?.name ?? 'Files'

  return (
    <>
      <AdminBreadcrumbs
        title={isRoot ? 'Files' : folderLabel}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          ...(isRoot ? [] : [{ label: 'Files', href: adminFilesHref([]) }]),
          ...trail.slice(0, -1).map((crumb) => ({
            label: crumb.name,
            href: adminFilesHref(crumb.slugs),
          })),
        ]}
      />
      <div className="container mx-auto px-4 py-6 sm:px-8">
        <PageHeader
          title="Files"
          description="Upload, organize, and browse the community's files."
          className="mb-5"
        >
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Suspense
              fallback={<Skeleton className="h-8 w-full sm:w-[200px]" />}
            >
              <StorageMeter />
            </Suspense>
            <div className="flex items-center gap-2">
              <CreateFolderDialog
                parentPath={storagePath}
                parentLabel={folderLabel}
              />
              {!isRoot && (
                <FileUpload
                  folder={storagePath}
                  buttonText="Upload"
                  buttonVariant="default"
                  buttonSize="default"
                  className="h-11 px-4.5 md:h-9.5"
                />
              )}
            </div>
          </div>
        </PageHeader>

        <div className="flex flex-col gap-4 md:flex-row md:gap-5">
          <FolderRail area="admin" folders={rootFolders} />
          {isNil(view) ? (
            <NoFolderSelected folders={rootFolders} />
          ) : (
            <FileBrowserTable
              area="admin"
              entries={view.entries}
              caption={describeFolderContents(view.entries, folderLabel)}
              emptyMessage={`Nothing in ${folderLabel} yet.`}
            />
          )}
        </div>
      </div>
    </>
  )
}

/** Shown on /admin/files before a folder is picked from the rail. */
function NoFolderSelected({ folders }: { folders: RootFolder[] }) {
  const hasFolders = folders.length > 0
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-md border border-dashed bg-card px-6 py-16 text-center">
      <FolderOpen className="mb-4 size-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-medium text-foreground">
        {hasFolders ? 'Pick a folder to get started' : 'No folders yet'}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFolders
          ? 'Choose a folder to see its files, or create a new one. Files are uploaded into the folder you have open.'
          : "Create a folder to start organizing the community's files."}
      </p>
    </div>
  )
}
