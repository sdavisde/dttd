import { notFound } from 'next/navigation'
import { fetchFolderContents } from '@/lib/files'
import { isErr } from '@/lib/results'
import { unslugify } from '@/util/url'
import { PublicFilesFolderContent } from '@/components/public-files/PublicFilesFolderContent'
import { Typography } from '@/components/ui/typography'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

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
    console.error(contentsResult.error)
    notFound()
  }

  const folderName = unslugify(pathSegments.at(-1) ?? 'Files')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link href="/files" className="text-muted-foreground hover:text-foreground">
          Files
        </Link>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          const href = `/files/${pathSegments.slice(0, index + 1).join('/')}`
          const name = unslugify(segment)
          
          return (
            <div key={segment} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium">{name}</span>
              ) : (
                <Link href={href} className="text-muted-foreground hover:text-foreground">
                  {name}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      <div className="mb-6">
        <Typography variant="h3">{folderName}</Typography>
      </div>

      <PublicFilesFolderContent
        files={contentsResult.data}
        folderName={folderName}
      />
    </div>
  )
}