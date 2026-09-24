'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filesHref, type FilesArea, type RootFolder } from '@/lib/files/browser'

type FolderRailProps = {
  area: FilesArea
  folders: RootFolder[]
}

/**
 * Persistent folder navigation for the Files browser. A vertical rail on
 * desktop; a horizontally scrollable chip row on mobile. Reads the open folder
 * from the URL so it can live in a layout and stay mounted between folders.
 */
export function FolderRail({ area, folders }: FolderRailProps) {
  const pathname = usePathname()
  const root = filesHref(area, [])
  const activeSlug = pathname.startsWith(`${root}/`)
    ? (pathname
        .slice(root.length + 1)
        .split('/')
        .at(0) ?? null)
    : null

  return (
    <nav aria-label="Folders" className="min-w-0 md:w-[220px] md:shrink-0">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0">
        {folders.map((folder) => {
          const isActive = folder.slug === activeSlug
          const Icon = isActive ? FolderOpen : Folder
          return (
            <li key={folder.slug} className="shrink-0 md:shrink">
              <Link
                href={filesHref(area, [folder.slug])}
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
                <span className="md:truncate">{folder.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {area === 'admin' && (
        <p className="mt-3 hidden border-t border-border px-3 pt-2.5 text-[13px] leading-normal text-muted-foreground md:block">
          Members browse these same folders on the Documents page.
        </p>
      )}
    </nav>
  )
}
