import { cn } from '@/lib/utils'

type PageContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Narrow, centered column for forms and reading pages. */
  size?: 'full' | 'narrow'
}

/**
 * The gutter every member page renders inside. Owned by the shell (not by
 * pages) so spacing is identical everywhere, and `min-w-0` so wide content
 * scrolls inside its own container instead of the page.
 */
export function PageContent({
  size = 'full',
  className,
  ...props
}: PageContentProps) {
  return (
    <div
      className={cn(
        'w-full min-w-0 px-4 py-6 md:px-8 md:py-7 lg:px-12',
        size === 'narrow' && 'mx-auto max-w-3xl',
        className
      )}
      {...props}
    />
  )
}
