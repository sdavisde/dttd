import { Skeleton } from '@/components/ui/skeleton'

/**
 * Route-level fallback for the admin shell. Mirrors the frame every admin page
 * opens with — the breadcrumb bar, the PageHeader block, then content cards —
 * so the layout does not jump when the real page streams in.
 */
export default function Loading() {
  return (
    <>
      {/* Breadcrumb bar (matches AdminBreadcrumbs' height and gutters) */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-3 px-4">
          <Skeleton className="size-7" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-8 py-6">
        {/* PageHeader: serif title, muted description, action slot */}
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2.5">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="size-9" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Content cards */}
        <div className="space-y-4">
          {[0, 1].map((card) => (
            <div key={card} className="space-y-4 rounded-lg border bg-card p-6">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
