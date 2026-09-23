import { notFound } from 'next/navigation'
import { fetchFolderContents } from '@/lib/files'
import { isErr } from '@/lib/results'
import { unslugify } from '@/lib/url'
import { logger } from '@/lib/logger'
import { PublicFilesFolderContent } from '@/components/public-files/PublicFilesFolderContent'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

export default async function PublicFilesNestedPage({
  params,
}: {
  params: Promise<{ path: string[] | string }>
}) {
  let { path: pathSegments } = await params
  pathSegments =
    typeof pathSegments === 'string' ? [pathSegments] : pathSegments

  const contentsResult = await fetchFolderContents(pathSegments)
  if (isErr(contentsResult)) {
    logger.error(contentsResult.error)
    notFound()
  }

  const folderName = unslugify(pathSegments.at(-1) ?? 'Files')
  const parentCrumbs = pathSegments.slice(0, -1).map((segment, index) => ({
    label: unslugify(segment),
    href: `/files/${pathSegments.slice(0, index + 1).join('/')}`,
  }))

  return (
    <PageContent>
      <MemberBreadcrumbs
        title={folderName}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Documents', href: '/files' },
          ...parentCrumbs,
        ]}
      />
      <PageHeader title={folderName} />

      <PublicFilesFolderContent
        files={contentsResult.data}
        folderName={folderName}
      />
    </PageContent>
  )
}
