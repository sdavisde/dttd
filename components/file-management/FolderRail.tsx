import Link from 'next/link'
import { Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminFilesHref, type RootFolder } from '@/lib/files/browser'

type FolderRailProps = {
  folders: RootFolder[]
  /** Slug of the top-level folder being viewed; null on "All files" */
  activeSlug: string | null
}

/**
 * Persistent folder navigation for the admin Files page. A vertical rail on
 * desktop; a horizontally scrollable chip row on mobile.
 */
export function FolderRail({ folders, activeSlug }: FolderRailProps) {
  const items = [
    { key: '__all', label: 'All files', href: adminFilesHref([]), slug: null },
    ...folders.map((folder) => ({
      key: folder.slug,
      label: folder.name,
      href: adminFilesHref([folder.slug]),
      slug: folder.slug as string | null,
    })),
  ]

  return (
    <nav aria-label="Folders" className="min-w-0 md:w-[220px] md:shrink-0">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0">
        {items.map((item) => {
          const isActive = item.slug === activeSlug
          const Icon = isActive ? FolderOpen : Folder
          return (
            <li key={item.key} className="shrink-0 md:shrink">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-md border border-border px-3 text-sm font-medium whitespace-nowrap text-nav-foreground transition-colors hover:bg-muted md:min-h-0 md:border-transparent md:py-2 md:whitespace-normal',
                  isActive &&
                    'border-secondary-border bg-muted font-semibold text-foreground md:border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="md:truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 hidden border-t border-border px-3 pt-2.5 text-[13px] leading-normal text-muted-foreground md:block">
        Members browse these same folders on the community Files page.
      </p>
    </nav>
  )
}
