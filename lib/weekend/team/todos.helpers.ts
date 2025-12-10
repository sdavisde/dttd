import { isNil } from 'lodash'
import {
  TodoItemConfig,
  TodoCompletionContext,
  TodoCompletionState,
} from './todos.types'

/**
 * Generates the full URL for a TODO item, including any dynamic parameters
 */
export function getTodoUrl(
  item: TodoItemConfig,
  context: TodoCompletionContext
): string | null {
  if (isNil(item.href)) {
    return null
  }

  const params = item.params ? item.params(context) : ''
  return `${item.href}${params}`
}

/**
 * Checks completion status for all TODO items and returns a completion state map
 */
export async function getCompletionState(
  items: TodoItemConfig[],
  context: TodoCompletionContext
): Promise<TodoCompletionState> {
  const completionState: TodoCompletionState = {}

  await Promise.all(
    items.map(async (item) => {
      if (item.checkCompletion) {
        completionState[item.id] = await item.checkCompletion(context)
      } else {
        completionState[item.id] = false
      }
    })
  )

  return completionState
}

/**
 * Checks if all TODO items are complete
 */
export function areAllTodosComplete(
  items: TodoItemConfig[],
  completionState: TodoCompletionState
): boolean {
  return items.every((item) => completionState[item.id] === true)
}
