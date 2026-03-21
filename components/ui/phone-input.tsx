'use client'

import * as React from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function PhoneInput({
  className,
  onChange,
  ...props
}: React.ComponentProps<'input'>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    ;(e.target as HTMLInputElement).value = formatted
    onChange?.(e)
  }

  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="tel"
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'pl-9 pr-3',
          className
        )}
        placeholder="(555) 555-5555"
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}

export { PhoneInput, formatPhoneNumber }
