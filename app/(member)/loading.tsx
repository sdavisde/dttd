import { Skeleton } from '@/components/ui/skeleton'
import { PageContent } from '@/components/member/page-content'

/**
 * Route-level fallback for the member shell. Mirrors the frame every member
 * page opens with — breadcrumb, PageHeader block, then content cards — so the
 * layout does not jump when the real page streams in.
 */
export default function Loading() {
  return (
    <PageContent>
      <div className="mb-4 flex h-7 items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
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
    </PageContent>
  )
}
