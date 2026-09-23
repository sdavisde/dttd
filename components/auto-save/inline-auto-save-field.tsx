'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { Input } from '@/components/ui/input'
import { useAutoSave } from '@/hooks/use-auto-save'
import type { Result } from '@/lib/results'
import { cn } from '@/lib/utils'
import { AutoSaveStatusIndicator } from './auto-save-status'

interface InlineAutoSaveFieldProps {
  /** The saved value when editing starts. */
  initialValue: string
  save: (value: string) => Promise<Result<unknown, unknown>>
  /** Returns a message when the value can't be saved, null when it can. */
  validate: (value: string) => string | null
  errorMessage: string
  /** Leave edit mode. Anything still pending saves as the field unmounts. */
  onDone: () => void
  onSaved?: (value: string) => void
  type?: string
  placeholder?: string
  ariaLabel: string
  inputClassName?: string
  className?: string
}

/**
 * A single inline-edited value (click the pencil, type, click away). Saves as
 * you type once valid; blur, Enter or Escape closes it unless the value is
 * invalid, in which case the reason shows and the field stays open.
 */
export function InlineAutoSaveField({
  initialValue,
  save,
  validate,
  errorMessage,
  onDone,
  onSaved,
  type = 'text',
  placeholder,
  ariaLabel,
  inputClassName,
  className,
}: InlineAutoSaveFieldProps) {
  const [value, setValue] = useState(initialValue)
  const [showError, setShowError] = useState(false)
  const validationError = validate(value)

  const autoSave = useAutoSave({
    value,
    isValid: isNil(validationError),
    errorMessage,
    onSaved,
    save: (next) => save(next.trim()),
  })

  const finish = () => {
    if (!isNil(validationError)) {
      setShowError(true)
      return
    }
    onDone()
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          autoFocus
          type={type}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={finish}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={showError && !isNil(validationError)}
          className={inputClassName}
        />
        <AutoSaveStatusIndicator
          // A half-typed address is always "invalid"; only say so once they
          // try to leave the field.
          status={
            autoSave.status === 'invalid' && !showError
              ? 'idle'
              : autoSave.status
          }
          onRetry={autoSave.flush}
        />
      </div>
      {showError && !isNil(validationError) && (
        <p className="text-xs text-destructive">{validationError}</p>
      )}
    </div>
  )
}
