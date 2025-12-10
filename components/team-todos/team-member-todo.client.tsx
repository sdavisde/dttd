'use client'

import { useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PartyPopper } from 'lucide-react'
import { TodoItem } from './todo-item'
import {
  TodoItemConfig,
  TodoCompletionState,
} from '@/lib/weekend/team/todos.types'
import {
  getTodoCompletion,
  setTodoCompletion,
} from '@/lib/weekend/team/todos.localStorage'

type TeamMemberTodoListProps = {
  items: Array<Omit<TodoItemConfig, 'checkCompletion' | 'params'>>
  urls: Record<string, string | null>
  completionState: TodoCompletionState
  weekendId: string
}

/**
 * Hydrates completion state by merging server state with localStorage.
 * Only called on client side.
 */
function hydrateCompletionState(
  items: TodoItemConfig[],
  serverState: TodoCompletionState,
  weekendId: string
): TodoCompletionState {
  if (typeof window === 'undefined') {
    return serverState
  }

  const hydratedState = { ...serverState }

  items.forEach((item) => {
    if (item.clientSideCompletion) {
      const isComplete = getTodoCompletion(weekendId, item.id)
      if (isComplete) {
        hydratedState[item.id] = true
      }
    }
  })

  return hydratedState
}

/**
 * Client component that renders the todo list with localStorage hydration.
 * Handles client-side completion tracking for todos marked with clientSideCompletion.
 */
export function TeamMemberTodoClient({
  items,
  urls,
  completionState: serverCompletionState,
  weekendId,
}: TeamMemberTodoListProps) {
  // Track which todos have been clicked this session (for immediate UI updates)
  const [clickedTodos, setClickedTodos] = useState<Record<string, boolean>>({})

  // Compute final completion state by merging server state, localStorage, and clicks
  const completionState = useMemo(() => {
    const hydrated = hydrateCompletionState(
      items,
      serverCompletionState,
      weekendId
    )
    return { ...hydrated, ...clickedTodos }
  }, [items, serverCompletionState, weekendId, clickedTodos])

  const handleTodoClick = (todoId: string) => {
    // Save to localStorage
    setTodoCompletion(weekendId, todoId)

    // Update clicked state for immediate UI feedback
    setClickedTodos((prev) => ({
      ...prev,
      [todoId]: !prev[todoId],
    }))
  }

  const allComplete = items.every((item) => completionState[item.id])

  return (
    <>
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
          onLinkClick={
            item.clientSideCompletion
              ? () => handleTodoClick(item.id)
              : undefined
          }
        />
      ))}
    </>
  )
}
