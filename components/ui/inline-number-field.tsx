'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'

interface InlineNumberFieldProps {
  value: number | null
  onSave: (value: number) => Promise<void>
  schema?: z.ZodNumber
  placeholder?: string
  emptyText?: string
  className?: string
  inputClassName?: string
}

const defaultSchema = z.number({ message: 'Must be a valid number' })

export function InlineNumberField({
  value,
  onSave,
  schema = defaultSchema,
  placeholder,
  emptyText = 'Not set',
  className,
  inputClassName,
}: InlineNumberFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Store as string in form, validate as number
  const formSchema = z.object({
    value: z
      .string()
      .min(1, 'Value is required')
      .refine((val) => !isNaN(Number(val)), {
        message: 'Must be a valid number',
      })
      .transform((val) => Number(val))
      .pipe(schema),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { value: value?.toString() ?? '' },
  })

  const { isSubmitting } = form.formState

  function handleClick() {
    if (!isSubmitting) {
      form.reset({ value: value?.toString() ?? '' })
      setIsEditing(true)

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
      form.reset({ value: value?.toString() ?? '' })
      setIsEditing(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      form.reset({ value: value?.toString() ?? '' })
      setIsEditing(false)
    }
  }

  async function onSubmit(data: { value: number }) {
    if (data.value !== value) {
      await onSave(data.value)
    }
    setIsEditing(false)
  }

  const error = form.formState.errors.value

  if (isEditing) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <input
          {...form.register('value')}
          ref={(e) => {
            form.register('value').ref(e)
            ;(
              inputRef as React.MutableRefObject<HTMLInputElement | null>
            ).current = e
          }}
          type="text"
          inputMode="numeric"
          disabled={isSubmitting}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-input px-2 py-1 text-base outline-none transition-colors',
            'focus:border-ring focus:ring-1 focus:ring-ring',
            !isNil(error) && 'border-destructive focus:ring-destructive',
            isSubmitting && 'opacity-50',
            inputClassName
          )}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {!isNil(error) && (
          <p className="absolute -bottom-5 left-0 text-xs text-destructive">
            {error.message}
          </p>
        )}
      </form>
    )
  }

  const displayValue = isNil(value) ? '' : value.toString()
  const isEmpty = displayValue === ''

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
