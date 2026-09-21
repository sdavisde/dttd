import * as React from 'react'
import { isNil } from 'lodash'

import { PageHeaderShareButton } from '@/components/ui/page-header-share-button'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  /**
   * Whether the copy-link control appears ahead of the page's own actions.
   * On by default; the button itself only renders under `/admin`, so admin
   * pages get it for free and public pages are untouched. Set `false` to opt
   * a page out entirely.
   */
  shareable?: boolean
}

/**
 * Standard page opener: serif title, muted description, and an optional
 * right-aligned action slot via children. Keeps every page starting with the
 * same rhythm.
 */
function PageHeader({
  title,
  description,
  shareable = true,
  children,
  className,
  ...props
}: PageHeaderProps) {
  const hasActions = shareable || !isNil(children)
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl font-semibold tracking-tight lg:text-4xl">
          {title}
        </h1>
        {!isNil(description) && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {hasActions && (
        <div className="flex shrink-0 items-center gap-2">
          {shareable && <PageHeaderShareButton title={title} />}
          {children}
        </div>
      )}
    </div>
  )
}

export { PageHeader }
