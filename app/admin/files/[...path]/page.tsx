import { notFound } from 'next/navigation'
import { fetchFolderContents } from '@/lib/files'
import { isErr } from '@/lib/results'
import { unslugify } from '@/lib/url'
import FilesFolderContent from '@/components/file-management/FilesFolderContent'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

export default async function FilesNestedPage({
  params,
}: {
  params: Promise<{ path: string[] | string }>
}) {
  let { path: pathSegments } = await params
  pathSegments =
    typeof pathSegments === 'string' ? [pathSegments] : pathSegments

  const contentsResult = await fetchFolderContents(pathSegments)
  if (isErr(contentsResult)) {
    console.error(contentsResult.error)
    notFound()
  }

  const folderName = unslugify(pathSegments.at(-1) ?? 'Files')

  return (
    <div className="min-h-[80vh]">
      <AdminBreadcrumbs
        title={folderName}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Files', href: '/admin/files' },
        ]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <PageHeader
          title={folderName}
          description="Files in this folder — upload, download, or remove them."
          className="capitalize [&_p]:normal-case"
        />
        <FilesFolderContent
          files={contentsResult.data}
          folderName={folderName}
        />
      </div>
    </div>
  )
}
