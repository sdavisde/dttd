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
    <div className="w-full">
      <nav aria-label="Progress">
        <ol
          role="list"
          className="flex items-start justify-between w-full max-w-4xl mx-auto px-4"
        >
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isFuture = index > currentStepIndex

            return (
              <li key={step.name} className="flex-1 flex flex-col items-center relative">
                {/* Connector Line (except for first item) */}
                {index !== 0 && (
                  <div
                    className={cn(
                      'absolute top-4 sm:top-5 left-[-50%] w-full h-0.5 z-0',
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
