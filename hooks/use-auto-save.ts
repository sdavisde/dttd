'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { isEqual, isNil } from 'lodash'
import { isErr, type Result } from '@/lib/results'
import { toastError } from '@/lib/toast-error'

export const AUTO_SAVE_DELAY_MS = 800

/**
 * - `idle`: nothing has been edited yet
 * - `pending`: edited, waiting for the debounce to fire
 * - `saving`: a save is in flight
 * - `saved`: everything on screen is persisted
 * - `invalid`: edited, but the form can't be saved until it's fixed
 * - `error`: the last save failed; the next edit (or `retry`) tries again
 */
export type AutoSaveStatus =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'invalid'
  | 'error'

interface UseAutoSaveOptions<T> {
  /** The current form value. Compared by value, so a fresh object each render is fine. */
  value: T
  /** Persists `value`. An `Err` result (or a throw) marks the save as failed. */
  save: (value: T) => Promise<Result<unknown, unknown>>
  /** Friendly message for the error toast when a save fails. */
  errorMessage: string
  /** False while the form has validation errors; edits wait until it's valid again. */
  isValid?: boolean
  /** False for read-only viewers; nothing is ever saved. */
  enabled?: boolean
  delay?: number
  onSaved?: (value: T) => void
}

/**
 * Debounced auto-save for an edit form. Saves `delay` ms after the last change
 * once the value is valid, runs one save at a time (so responses can't land
 * out of order), saves anything pending on unmount, and warns before the tab
 * closes with unsaved changes.
 *
 * The baseline is the value on first render, so remount (e.g. `key={id}`) to
 * point the form at a different record.
 */
export function useAutoSave<T>({
  value,
  save,
  errorMessage,
  isValid = true,
  enabled = true,
  delay = AUTO_SAVE_DELAY_MS,
  onSaved,
}: UseAutoSaveOptions<T>) {
  const [savedValue, setSavedValue] = useState<T>(value)
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  )

  const latestRef = useRef(value)
  const savedRef = useRef(value)
  const canSaveRef = useRef(enabled && isValid)
  const saveRef = useRef(save)
  const onSavedRef = useRef(onSaved)
  const errorMessageRef = useRef(errorMessage)
  const inFlightRef = useRef<Promise<void> | null>(null)
  const immediateRef = useRef(false)

  useEffect(() => {
    latestRef.current = value
    canSaveRef.current = enabled && isValid
    saveRef.current = save
    onSavedRef.current = onSaved
    errorMessageRef.current = errorMessage
  })

  const isDirty = !isEqual(value, savedValue)

  const runSave = useCallback(async () => {
    while (!isNil(inFlightRef.current)) await inFlightRef.current

    const snapshot = latestRef.current
    if (!canSaveRef.current || isEqual(snapshot, savedRef.current)) return

    setPhase('saving')
    const attempt = (async () => {
      try {
        const result = await saveRef.current(snapshot)
        if (isErr(result)) throw result.error
        savedRef.current = snapshot
        setSavedValue(snapshot)
        setPhase('saved')
        onSavedRef.current?.(snapshot)
      } catch (error) {
        setPhase('error')
        toastError(errorMessageRef.current, { error })
      }
    })()
    inFlightRef.current = attempt
    await attempt
    inFlightRef.current = null
  }, [])

  // JSON key so callers can pass a freshly built object without re-arming the
  // timer every render.
  const valueKey = JSON.stringify(value)
  useEffect(() => {
    if (!enabled || !isValid || !isDirty) return
    const wait = immediateRef.current ? 0 : delay
    immediateRef.current = false
    const timer = setTimeout(runSave, wait)
    return () => clearTimeout(timer)
  }, [valueKey, enabled, isValid, isDirty, delay, runSave])

  // Save whatever is still pending when the editor goes away.
  useEffect(() => () => void runSave(), [runSave])

  const saveImmediately = useCallback(() => {
    immediateRef.current = true
  }, [])

  const hasUnsaved = enabled && (isDirty || phase === 'saving')
  useEffect(() => {
    if (!hasUnsaved) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsaved])

  let status: AutoSaveStatus = phase
  if (!enabled) status = 'idle'
  else if (phase === 'saving') status = 'saving'
  else if (isDirty && !isValid) status = 'invalid'
  else if (isDirty && phase !== 'error') status = 'pending'

  return {
    status,
    isDirty,
    /** Skip the debounce for the next change (selects, toggles, pickers). */
    saveImmediately,
    /** Save now, e.g. from a "Retry" affordance or before closing. */
    flush: runSave,
  }
}

const STATUS_PRIORITY: AutoSaveStatus[] = [
  'error',
  'invalid',
  'saving',
  'pending',
  'saved',
  'idle',
]

/** Rolls several auto-saved sections up into the one status the editor shows. */
export function combineAutoSaveStatus(
  statuses: AutoSaveStatus[]
): AutoSaveStatus {
  return (
    STATUS_PRIORITY.find((candidate) => statuses.includes(candidate)) ?? 'idle'
  )
}
