'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { StepLink } from './step-link'
import { Step } from './types'

type TeamFormsStepperProps = {
  steps: Step[]
  maxReachableStepIndex: number
}

export function TeamFormsStepper({
  steps,
  maxReachableStepIndex,
}: TeamFormsStepperProps) {
  const pathname = usePathname()

  // Find the index of the current path
  const currentStepIndex = steps.findIndex((step) => pathname === step.path)

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol
          role="list"
          className="flex items-start justify-between w-full max-w-4xl mx-auto px-4"
        >
          {steps.map((step, index) => {
            const isCompleted = index < maxReachableStepIndex
            const isCurrent = index === currentStepIndex
            // A step is locked if it's beyond the max reachable step
            const isLocked = index > maxReachableStepIndex

            return (
              <li
                key={step.name}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Connector Line (except for first item) */}
                {index !== 0 && (
                  <div
                    className={cn(
                      'absolute top-4 sm:top-5 left-[-50%] w-full h-0.5 z-0',
                      index <= maxReachableStepIndex ? 'bg-primary' : 'bg-muted'
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
                  disabled={isLocked}
                />
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
