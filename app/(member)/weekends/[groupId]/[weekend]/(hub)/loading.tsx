import { Skeleton } from '@/components/ui/skeleton'

/**
 * The body below the hub tabs while a tab loads. The header, switch and tabs
 * come from the layout and stay on screen, so only this part flashes.
 */
export default function WeekendHubLoading() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Skeleton className="h-56 w-full rounded-lg" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    </>
  )
}
