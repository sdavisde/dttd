import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'
import { PageHeader } from '@/components/ui/page-header'
import { FolderRail } from '@/components/file-management/FolderRail'
import { Results } from '@/lib/results'
import { getRootFolders } from '@/services/files/file-service'

/**
 * The Documents page's shared frame: header and folder rail. As a layout it
 * stays mounted while folders change — only the pane on the right reloads
 * (with its own skeleton). Browse only: managing files happens in Admin › Files.
 */
export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const rootFolders = Results.unwrapOr(await getRootFolders(), [])

  return (
    <PageContent>
      <MemberBreadcrumbs
        title="Documents"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <PageHeader
        title="Documents"
        description="Files shared with the community — handbooks, directions, packing lists."
        className="mb-5"
      />

      <div className="flex flex-col gap-4 md:flex-row md:gap-5">
        <FolderRail area="member" folders={rootFolders} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </PageContent>
  )
}
