import { Suspense } from 'react'
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
  describeAllFiles,
  describeFolderContents,
} from '@/lib/files/browser'
import { logger } from '@/lib/logger'
import { isErr, Results } from '@/lib/results'
import {
  getAdminAllFilesView,
  getAdminFolderView,
  getRootFolders,
} from '@/services/files/file-service'
import { getLoggedInUser } from '@/services/identity/user'
import { StorageMeter } from './storage-meter'

type FilesPageProps = {
  /** URL slugs below /admin/files; empty for "All files" */
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
    isRoot ? getAdminAllFilesView() : getAdminFolderView(pathSegments),
    getRootFolders(),
  ])

  if (isErr(userResult) || isNil(userResult.data)) {
    redirect('/')
  }

  if (isErr(viewResult)) {
    logger.error({ error: viewResult.error }, 'Unable to load admin files')
    notFound()
  }

  const { storagePath, trail, entries } = viewResult.data
  const rootFolders = Results.unwrapOr(rootFoldersResult, [])
  const folderLabel = trail.at(-1)?.name ?? 'All files'

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
              <FileUpload
                folder={storagePath}
                disabled={isRoot}
                buttonText="Upload"
                buttonVariant="default"
                buttonSize="default"
                className="h-11 px-4.5 md:h-9.5"
              />
            </div>
          </div>
        </PageHeader>

        <div className="flex flex-col gap-4 md:flex-row md:gap-5">
          <FolderRail
            folders={rootFolders}
            activeSlug={trail.at(0)?.slugs.at(0) ?? null}
          />
          <FileBrowserTable
            entries={entries}
            showFolderColumn={isRoot}
            caption={
              isRoot
                ? `${describeAllFiles(entries)} · open a folder to upload files`
                : describeFolderContents(entries, folderLabel)
            }
            emptyMessage={
              isRoot
                ? 'No files yet. Open a folder to upload the first one.'
                : `Nothing in ${folderLabel} yet.`
            }
          />
        </div>
      </div>
    </>
  )
}
