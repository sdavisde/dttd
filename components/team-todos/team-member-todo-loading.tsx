import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the team member TODO list.
 * Displayed while async data is being fetched.
 */
export function TeamMemberTodoLoading() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-1 w-12" />
        </div>
      </div>
      <div className="space-y-1">
        {/* Simulate 3 TODO items loading */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="size-5 rounded-sm" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
