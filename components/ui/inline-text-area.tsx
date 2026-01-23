'use client'

import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'

interface InlineTextAreaProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  schema?: z.ZodString
  placeholder?: string
  emptyText?: string
  className?: string
  textareaClassName?: string
  rows?: number
}

const defaultSchema = z.string()

export function InlineTextArea({
  value,
  onSave,
  schema = defaultSchema,
  placeholder,
  emptyText = 'Not set',
  className,
  textareaClassName,
  rows = 3,
}: InlineTextAreaProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState(value)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Keep displayValue in sync with prop when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setDisplayValue(value)
    }
  }, [value, isEditing])

  const formSchema = z.object({ value: schema })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { value: value ?? '' },
  })

  const { isSubmitting } = form.formState

  function handleClick() {
    if (!isSubmitting) {
      form.reset({ value: displayValue ?? '' })
      setIsEditing(true)

      setTimeout(() => {
        if (isNil(textareaRef.current)) {
          return
        }
        textareaRef.current.focus()
        textareaRef.current.select()
      }, 200)
    }
  }

  function handleBlur() {
    if (!isSubmitting) {
      form.handleSubmit(onSubmit)()
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      form.reset({ value: displayValue ?? '' })
      setIsEditing(false)
    }
  }

  async function onSubmit(data: { value: string }) {
    if (data.value !== displayValue) {
      try {
        await onSave(data.value)
        // Update local display value optimistically after successful save
        setDisplayValue(data.value)
        form.reset({ value: data.value ?? '' })
      } catch {
        // On error, revert to previous value
        form.reset({ value: displayValue ?? '' })
      }
    }
    setIsEditing(false)
  }

  const error = form.formState.errors.value

  if (isEditing) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <Controller
          control={form.control}
          name="value"
          render={({ field }) => (
            <textarea
              ref={textareaRef}
              disabled={isSubmitting}
              placeholder={placeholder}
              rows={rows}
              className={cn(
                'w-full rounded-md border border-input px-2 py-1 text-base outline-none transition-colors resize-y',
                'focus:border-ring focus:ring-1 focus:ring-ring',
                !isNil(error) && 'border-destructive focus:ring-destructive',
                isSubmitting && 'opacity-50',
                textareaClassName
              )}
              value={field.value}
              onChange={field.onChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          )}
        />
        {!isNil(error) && (
          <p className="absolute -bottom-5 left-0 text-xs text-destructive">
            {error.message}
          </p>
        )}
      </form>
    )
  }

  const currentValue = displayValue ?? ''
  const isEmpty = currentValue.trim() === ''

  return (
    <span
      onClick={handleClick}
      style={{ whiteSpace: 'pre-wrap' }}
      className={cn(
        'inline-block cursor-pointer rounded-md px-2 py-1 transition-colors',
        'hover:bg-muted',
        isEmpty && 'text-muted-foreground',
        className
      )}
    >
      {isEmpty ? emptyText : currentValue}
    </span>
  )
}
