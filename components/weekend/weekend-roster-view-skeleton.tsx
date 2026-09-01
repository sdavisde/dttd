import { Skeleton } from '@/components/ui/skeleton'

type WeekendRosterViewSkeletonProps = {
  /**
   * Rendered in place of the weekend title row's header slot (tabs, status
   * badge). Pass the real slot when it is already available at the page level
   * so it stays interactive while the roster streams in.
   */
  headerSlot?: React.ReactNode
}

/**
 * Loading fallback for {@link WeekendRosterView}. Mirrors the weekend header
 * (title, date range, candidates link), the optional experience chart, and the
 * roster table beneath it.
 */
export function WeekendRosterViewSkeleton({
  headerSlot,
}: WeekendRosterViewSkeletonProps) {
  return (
    <>
      {/* Weekend information header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-56" />
              {headerSlot ?? <Skeleton className="h-6 w-24 rounded-full" />}
            </div>
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="lg:w-auto">
            <Skeleton className="h-32 w-full rounded-xl lg:w-64" />
          </div>
        </div>
      </div>

      {/* Roster section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </>
  )
}
