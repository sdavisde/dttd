import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the team member TODO list.
 * Displayed while async data is being fetched.
 */
export function TeamMemberTodoLoading() {
  return (
    <div className="w-full">
      <div className="w-full mt-4 mb-2">
        <Typography variant="h2">Before the Third Team Meeting</Typography>
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
