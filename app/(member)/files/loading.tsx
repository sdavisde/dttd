import { Skeleton } from '@/components/ui/skeleton'

/**
 * The pane beside the folder rail while a folder loads. The header and rail
 * come from the layout and stay on screen, so only this part flashes.
 */
export default function DocumentsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-48" />
      <div className="hidden space-y-px overflow-hidden rounded-md border bg-card md:block">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
