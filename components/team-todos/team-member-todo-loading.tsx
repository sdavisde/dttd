import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the team member TODO list.
 * Displayed while async data is being fetched.
 */
export function TeamMemberTodoLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Before the Third Team Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Simulate 3 TODO items loading */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
