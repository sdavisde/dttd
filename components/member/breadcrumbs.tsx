import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbShareButton } from '@/components/ui/breadcrumb-share-button'

export type Crumb = {
  label: string
  href: string
}

type MemberBreadcrumbsProps = {
  /** The current page, rendered last and not linked. */
  title: string
  breadcrumbs: Crumb[]
  /** Show the hover copy-link action beside the current page. On by default. */
  shareable?: boolean
}

/**
 * The trail every member page opens with (before the serif title). Sits
 * inside the content gutter, per the boards. Earlier crumbs hide on phones so
 * the current page name never wraps under the top bar.
 */
export function MemberBreadcrumbs({
  title,
  breadcrumbs,
  shareable = true,
}: MemberBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="group/breadcrumbs mb-4 flex min-h-7 items-center gap-1 text-[13.5px] text-muted-foreground"
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={`${crumb.href}-${index}`}>
            <li className="hidden md:block">
              <Link
                href={crumb.href}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            </li>
            <li className="hidden md:block" aria-hidden>
              <ChevronRight className="size-3.5 text-muted-foreground/70" />
            </li>
          </Fragment>
        ))}
        <li
          className="truncate font-medium text-foreground"
          aria-current="page"
        >
          {title}
        </li>
      </ol>
      {shareable && <BreadcrumbShareButton title={title} />}
    </nav>
  )
}
