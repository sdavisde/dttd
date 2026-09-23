import * as React from 'react'
import { isNil } from 'lodash'

import { cn } from '@/lib/utils'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

/**
 * Standard page opener: serif title, muted description, and an optional
 * right-aligned action slot via children. Keeps every page starting with the
 * same rhythm.
 */
function PageHeader({
  title,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
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
      {!isNil(children) && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  )
}

export { PageHeader }
