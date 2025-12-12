'use client'

import { TeamFormsStepper } from '@/components/team-forms/stepper'
import { teamFormSteps } from '@/components/team-forms/steps.config'

export default function TeamFormsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background pt-6 gap-6">
      <TeamFormsStepper steps={teamFormSteps} />
      <div className="flex-1 container max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}
