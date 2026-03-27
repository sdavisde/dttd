'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isNil } from 'lodash'

/**
 * Formats a raw digit string into MM/DD/YYYY display format.
 */
function formatDateString(digits: string): string {
  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/**
 * Parses a formatted MM/DD/YYYY string into a Date, or returns undefined if invalid.
 */
function parseDate(formatted: string): Date | undefined {
  const digits = formatted.replace(/\D/g, '')
  if (digits.length !== 8) return undefined

  const month = parseInt(digits.slice(0, 2), 10)
  const day = parseInt(digits.slice(2, 4), 10)
  const year = parseInt(digits.slice(4, 8), 10)

  if (month < 1 || month > 12) return undefined
  if (day < 1 || day > 31) return undefined
  if (year < 1900 || year > 2100) return undefined

  // Construct date and verify it didn't roll over (e.g. Feb 30 -> Mar 2)
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

/**
 * Converts a Date to the raw digit string (MMDDYYYY).
 */
function dateToDigits(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = String(date.getFullYear())
  return `${mm}${dd}${yyyy}`
}

export interface DateInputProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Earliest allowed date */
  minDate?: Date
  /** Latest allowed date */
  maxDate?: Date
  /** Whether the field is required */
  required?: boolean
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

function DateInput({
  date,
  onDateChange,
  placeholder = 'MM/DD/YYYY',
  disabled = false,
  className,
  minDate,
  maxDate,
  required = false,
}: DateInputProps) {
  // Track raw digits internally
  const [digits, setDigits] = React.useState(() =>
    !isNil(date) ? dateToDigits(date) : ''
  )
  // Track whether input is focused to decide display format
  const [isFocused, setIsFocused] = React.useState(false)
  // Validation error shown after blur
  const [error, setError] = React.useState<string | null>(null)
  // Whether the field has been touched (blurred at least once)
  const [touched, setTouched] = React.useState(false)

  // Sync from external date prop changes (e.g. form reset, dev autofill)
  const lastExternalDate = React.useRef(date)
  React.useEffect(() => {
    if (date !== lastExternalDate.current) {
      lastExternalDate.current = date
      setDigits(!isNil(date) ? dateToDigits(date) : '')
    }
  }, [date])

  function validate(rawDigits: string): string | null {
    if (rawDigits.length === 0) {
      return required ? 'Required' : null
    }

    const parsed = parseDate(formatDateString(rawDigits))
    if (isNil(parsed)) {
      return 'Invalid date'
    }
    if (!isNil(minDate) && parsed < minDate) {
      return `Date must be after ${formatDisplay(minDate)}`
    }
    if (!isNil(maxDate) && parsed > maxDate) {
      return `Date must be before ${formatDisplay(maxDate)}`
    }
    return null
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    setDigits(raw)

    // Clear error while typing if the value becomes valid
    if (touched) {
      const err = validate(raw)
      if (isNil(err)) setError(null)
    }

    const parsed = parseDate(formatDateString(raw))
    if (!isNil(parsed)) {
      // Validate against min/max
      if (!isNil(minDate) && parsed < minDate) {
        onDateChange?.(undefined)
        return
      }
      if (!isNil(maxDate) && parsed > maxDate) {
        onDateChange?.(undefined)
        return
      }
      lastExternalDate.current = parsed
      onDateChange?.(parsed)
    } else {
      lastExternalDate.current = undefined
      onDateChange?.(undefined)
    }
  }

  function handleFocus() {
    setIsFocused(true)
  }

  function handleBlur() {
    setIsFocused(false)
    setTouched(true)
    setError(validate(digits))
  }

  // When not focused, show the friendly formatted date if we have a valid one
  const displayValue = isFocused
    ? formatDateString(digits)
    : !isNil(date)
      ? formatDisplay(date)
      : formatDateString(digits)

  return (
    <div>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          inputMode="numeric"
          data-slot="input"
          aria-invalid={!isNil(error) || undefined}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            'pl-9 pr-3',
            className
          )}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          maxLength={10}
          autoComplete="off"
        />
      </div>
      {!isNil(error) && (
        <p className="text-destructive text-sm mt-1.5">{error}</p>
      )}
    </div>
  )
}

export { DateInput }
