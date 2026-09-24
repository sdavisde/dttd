import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileBrowserTable } from '@/components/file-management/FileBrowserTable'
import { describeFolderContents, filesHref } from '@/lib/files/browser'
import { logger } from '@/lib/logger'
import { isErr } from '@/lib/results'
import { getFolderView } from '@/services/files/file-service'

/**
 * One folder's contents, in the pane beside the layout's folder rail. The
 * folder path sits above the listing (the page breadcrumb lives in the layout,
 * which can't see which folder is open).
 */
export default async function DocumentsFolderPage({
  params,
}: {
  params: Promise<{ path: string[] | string }>
}) {
  const { path } = await params
  const pathSegments = typeof path === 'string' ? [path] : path

  const viewResult = await getFolderView(pathSegments)
  if (isErr(viewResult)) {
    logger.error({ error: viewResult.error }, 'Unable to load documents')
    notFound()
  }

  const { trail, entries } = viewResult.data
  const folderLabel = trail.at(-1)?.name ?? 'Documents'

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <nav aria-label="Folder path">
        <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            return (
              <Fragment key={crumb.slugs.join('/')}>
                {index > 0 && (
                  <li aria-hidden>
                    <ChevronRight className="size-3.5 text-muted-foreground/70" />
                  </li>
                )}
                <li className="min-w-0 truncate">
                  {isLast ? (
                    <span
                      className="font-semibold text-foreground"
                      aria-current="page"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={filesHref('member', crumb.slugs)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </nav>

      <FileBrowserTable
        area="member"
        entries={entries}
        caption={describeFolderContents(entries, folderLabel)}
        emptyMessage={`Nothing in ${folderLabel} yet.`}
      />
    </div>
  )
}
