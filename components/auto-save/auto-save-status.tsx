'use client'

import { isNil } from 'lodash'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import type { AutoSaveStatus } from '@/hooks/use-auto-save'
import { cn } from '@/lib/utils'

interface AutoSaveStatusIndicatorProps {
  status: AutoSaveStatus
  onRetry?: () => void
  className?: string
}

/**
 * The small "Saving… / Saved / Not saved" line that replaces a Save button on
 * auto-saving editors. Sits in the editor header so it's visible without
 * scrolling. Renders nothing until the first edit.
 */
export function AutoSaveStatusIndicator({
  status,
  onRetry,
  className,
}: AutoSaveStatusIndicatorProps) {
  if (status === 'idle') return null

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 text-xs whitespace-nowrap',
        status === 'invalid' && 'text-amber-600 dark:text-amber-400',
        status === 'error' && 'text-destructive',
        (status === 'pending' || status === 'saving' || status === 'saved') &&
          'text-muted-foreground',
        className
      )}
    >
      {(status === 'pending' || status === 'saving') && (
        <>
          <Loader2 aria-hidden className="size-3 animate-spin" />
          Saving…
        </>
      )}
      {status === 'saved' && (
        <>
          <Check aria-hidden className="size-3" />
          Saved
        </>
      )}
      {status === 'invalid' && (
        <>
          <AlertCircle aria-hidden className="size-3" />
          Not saved · fix errors
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle aria-hidden className="size-3" />
          Not saved
          {!isNil(onRetry) && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          )}
        </>
      )}
    </span>
  )
}
