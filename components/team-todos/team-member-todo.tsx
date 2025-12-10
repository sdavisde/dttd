import { TeamMemberUser } from '@/lib/users/types'
import { getTeamTodoData } from '@/lib/weekend/team/todos.actions'
import { Typography } from '@/components/ui/typography'
import { isNil } from 'lodash'
import { TeamMemberTodoClient } from './team-member-todo.client'

type TeamMemberTodoProps = {
  user: TeamMemberUser
}

/**
 * Displays team member TODO list for their active weekend.
 * Server component that fetches data and delegates rendering to client wrapper.
 */
export async function TeamMemberTodo({ user }: TeamMemberTodoProps) {
  const todoData = await getTeamTodoData(user)

  if (isNil(todoData)) {
    return null
  }

  const { urls, completionState, items, weekendId } = todoData
  const serializableItems = items.map((item) => ({
    ...item,
    checkCompletion: undefined,
    params: undefined,
  }))

  return (
    <div className="w-full">
      <div className="w-full mt-4 mb-2">
        <Typography variant="h2">Team Member Checklist</Typography>
      </div>
      <div className="space-y-1">
        {/*
         * this server / client boundary only exists because we chose to allow
         * some TODO items to be marked off from the client side.
         * If we remove this assumption and save everything in the DB, we can remove this
         * in favor of a simpler, single component
         */}
        <TeamMemberTodoClient
          items={serializableItems}
          urls={urls}
          completionState={completionState}
          weekendId={weekendId}
        />
      </div>
    </div>
  )
}
