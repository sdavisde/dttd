import { Skeleton } from '@/components/ui/skeleton'

/**
 * Public segment loading fallback. Rendered inside the public layout so the
 * navbar and footer persist while the next page streams in.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mt-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
