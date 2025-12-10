import { TeamMemberUser } from '@/lib/users/types'
import { getTeamTodoData } from '@/lib/weekend/team/todos.actions'
import { Typography } from '@/components/ui/typography'
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
    <div className="w-full">
      <div className="w-full mt-4 mb-2">
        <Typography variant="h2">Before the Third Team Meeting</Typography>
      </div>
      <div className="space-y-1">
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
      </div>
    </div>
  )
}
