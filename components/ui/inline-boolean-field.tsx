'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'

interface InlineBooleanFieldProps {
  value: boolean | null
  onSave: (value: boolean) => Promise<void>
  trueLabel?: string
  falseLabel?: string
  emptyText?: string
  className?: string
}

export function InlineBooleanField({
  value,
  onSave,
  trueLabel = 'Yes',
  falseLabel = 'No',
  emptyText = 'Not set',
  className,
}: InlineBooleanFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  function handleClick() {
    if (!isSubmitting) {
      setIsEditing(true)
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsEditing(false)
    }
  }

  React.useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsEditing(false)
    }
  }

  async function handleSelect(newValue: boolean) {
    if (newValue !== value) {
      setIsSubmitting(true)
      try {
        await onSave(newValue)
      } finally {
        setIsSubmitting(false)
      }
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className="inline-flex gap-2 rounded-md border border-input p-1"
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSelect(true)}
          className={cn(
            'rounded px-3 py-1 text-sm transition-colors',
            value === true
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSelect(false)}
          className={cn(
            'rounded px-3 py-1 text-sm transition-colors',
            value === false
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {falseLabel}
        </button>
      </div>
    )
  }

  const displayValue = isNil(value) ? emptyText : value ? trueLabel : falseLabel
  const isEmpty = isNil(value)

  return (
    <span
      onClick={handleClick}
      className={cn(
        'inline-block cursor-pointer rounded-md px-2 py-1 transition-colors',
        'hover:bg-muted',
        isEmpty && 'text-muted-foreground',
        className
      )}
    >
      {displayValue}
    </span>
  )
}
