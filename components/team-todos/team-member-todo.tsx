import { TeamMemberUser } from '@/lib/users/types'
import { getTeamTodoData } from '@/lib/weekend/team/todos.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isNil } from 'lodash'
import { PartyPopper } from 'lucide-react'
import { TodoItem } from './todo-item'

type TeamMemberTodoProps = {
  user: TeamMemberUser
}

/**
 * Displays team member TODO list for their active weekend.
 * Server component that fetches and displays preparation tasks.
 */
export async function TeamMemberTodo({ user }: TeamMemberTodoProps) {
  const todoData = await getTeamTodoData(user)

  if (isNil(todoData)) {
    return null
  }

  const { urls, completionState, allComplete, items } = todoData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Before the Third Team Meeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {allComplete && (
          <Alert variant="success" className="mb-4">
            <PartyPopper className="size-5" />
            <AlertTitle>All Set!</AlertTitle>
            <AlertDescription>
              You&apos;ve completed all preparation tasks.
            </AlertDescription>
          </Alert>
        )}
        {items.map((item) => (
          <TodoItem
            key={item.id}
            label={item.label}
            href={urls[item.id]}
            isComplete={completionState[item.id] ?? false}
            tooltip={item.tooltip}
          />
        ))}
      </CardContent>
    </Card>
  )
}
