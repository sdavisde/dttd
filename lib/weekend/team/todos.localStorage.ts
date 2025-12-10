import { isNil } from 'lodash'

const STORAGE_KEY_PREFIX = 'dttd-todo'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

type StoredCompletion = {
  completed: boolean
  completedAt: number
  expiresAt: number
}

function getStorageKey(weekendId: string, todoId: string): string {
  return `${STORAGE_KEY_PREFIX}-${weekendId}-${todoId}`
}

/**
 * Get todo completion status from localStorage.
 * Returns false if not found or expired.
 */
export function getTodoCompletion(weekendId: string, todoId: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const key = getStorageKey(weekendId, todoId)
  const stored = localStorage.getItem(key)

  if (isNil(stored)) {
    return false
  }

  try {
    const data: StoredCompletion = JSON.parse(stored)

    // Check if expired
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(key)
      return false
    }

    return data.completed
  } catch {
    localStorage.removeItem(key)
    return false
  }
}

/**
 * Save todo completion to localStorage with 1-year expiry.
 */
export function setTodoCompletion(weekendId: string, todoId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const key = getStorageKey(weekendId, todoId)
  const now = Date.now()

  const data: StoredCompletion = {
    completed: true,
    completedAt: now,
    expiresAt: now + ONE_YEAR_MS,
  }

  localStorage.setItem(key, JSON.stringify(data))
}
