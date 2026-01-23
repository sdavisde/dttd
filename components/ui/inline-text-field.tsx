'use client'

import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'

interface InlineTextFieldProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  schema?: z.ZodString
  placeholder?: string
  emptyText?: string
  className?: string
  inputClassName?: string
}

const defaultSchema = z.string().min(1, 'Value is required')

export function InlineTextField({
  value,
  onSave,
  schema = defaultSchema,
  placeholder,
  emptyText = 'Not set',
  className,
  inputClassName,
}: InlineTextFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const formSchema = z.object({ value: schema })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { value: value ?? '' },
  })

  const { isSubmitting } = form.formState

  function handleClick() {
    if (!isSubmitting) {
      form.reset({ value: value ?? '' })
      setIsEditing(true)

      // Need to wait some time for the component to re-render before focusing the input,
      // since the ref doesn't always exist. This probably could be done better, se-la-vie
      setTimeout(() => {
        if (isNil(inputRef.current)) {
          return
        }
        inputRef.current.focus()
        inputRef.current.select()
      }, 200)
    }
  }

  function handleBlur() {
    if (!isSubmitting) {
      form.reset({ value: value ?? '' })
      setIsEditing(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      form.reset({ value: value ?? '' })
      setIsEditing(false)
    }
  }

  async function onSubmit(data: { value: string }) {
    if (data.value !== value) {
      await onSave(data.value)
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
            <input
              ref={inputRef}
              type="text"
              disabled={isSubmitting}
              placeholder={placeholder}
              className={cn(
                'w-full rounded-md border border-input px-2 py-1 text-base outline-none transition-colors',
                'focus:border-ring focus:ring-1 focus:ring-ring',
                !isNil(error) && 'border-destructive focus:ring-destructive',
                isSubmitting && 'opacity-50',
                inputClassName
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

  const displayValue = value ?? ''
  const isEmpty = displayValue.trim() === ''

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
      {isEmpty ? emptyText : displayValue}
    </span>
  )
}
