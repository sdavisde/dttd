'use client'

import { TeamFormsStepper } from '@/components/team-forms/stepper'
import { teamFormSteps } from '@/components/team-forms/steps.config'

export default function TeamFormsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TeamFormsStepper steps={teamFormSteps} />
      <div className="flex-1 container max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
