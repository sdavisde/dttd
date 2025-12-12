'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { StepLink } from './step-link'
import { Step } from './types'

type TeamFormsStepperProps = {
  steps: Step[]
}

export function TeamFormsStepper({ steps }: TeamFormsStepperProps) {
  const pathname = usePathname()

  // Find the index of the current path to determine active/completed state
  const currentStepIndex = steps.findIndex((step) => pathname === step.path)

  return (
    <div className="w-full py-6">
      <nav aria-label="Progress">
        <ol
          role="list"
          className="flex items-center justify-center space-x-2 sm:space-x-8 max-w-4xl mx-auto overflow-x-auto px-4 pb-10 overflow-visible"
        >
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isFuture = index > currentStepIndex

            return (
              <li key={step.name} className="flex items-center relative">
                {/* Connector Line (except for first item) */}
                {index !== 0 && (
                  <div
                    className={cn(
                      'absolute right-full top-1/2 -translate-y-1/2 h-0.5 w-8 sm:w-16 mr-2 sm:mr-4',
                      index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-hidden="true"
                  />
                )}

                <StepLink
                  step={step}
                  index={index}
                  state={
                    isCompleted ? 'completed' : isCurrent ? 'current' : 'future'
                  }
                  disabled={isFuture && !isCompleted}
                />
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
