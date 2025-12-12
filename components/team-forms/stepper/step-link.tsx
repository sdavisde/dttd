'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Step } from './types'

export type StepLinkProps = {
  step: Step
  index: number
  state: 'completed' | 'current' | 'future'
  disabled: boolean
}

export function StepLink({ step, index, state, disabled }: StepLinkProps) {
  const content = (
    <>
      <span className="flex items-center justify-center relative z-10">
        <span
          className={cn(
            'flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-xs sm:text-sm font-medium transition-colors bg-background',
            state === 'completed'
              ? 'border-primary bg-primary text-primary-foreground'
              : state === 'current'
                ? 'border-primary text-primary'
                : 'border-muted-foreground/30 text-muted-foreground'
          )}
        >
          {state === 'completed' ? (
            <Check className="h-5 w-5" />
          ) : (
            <span>{index + 1}</span>
          )}
        </span>
      </span>
      <span
        className={cn(
          'mt-2 text-[10px] sm:text-xs font-medium text-center',
          state === 'current' ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {step.name}
      </span>
    </>
  )

  if (disabled) {
    return (
      <div className="group relative flex items-center justify-center flex-col opacity-100 cursor-not-allowed">
        {content}
      </div>
    )
  }

  return (
    <Link
      href={step.path}
      className={cn(
        'group relative flex items-center justify-center flex-col',
        state === 'current' ? 'pointer-events-none' : ''
      )}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      {content}
    </Link>
  )
}
