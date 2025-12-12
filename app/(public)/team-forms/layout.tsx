import { Card } from '@/components/ui/card'
import { TeamFormsStepper } from '@/components/team-forms/stepper'
import { teamFormSteps } from '@/components/team-forms/steps.config'
import { getLoggedInUser } from '@/actions/users'
import { getTeamFormsProgress } from '@/actions/team-forms'
import { isErr } from '@/lib/results'
import { redirect } from 'next/navigation'
import { isNil } from 'lodash'

export default async function TeamFormsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  if (isNil(user.team_member_info)) {
    // Ideally redirect to a "not on roster" page or show an error
    // For now, redirecting to home
    redirect('/')
  }

  const progressResult = await getTeamFormsProgress(user.team_member_info.id)

  let maxReachableStepIndex = 0

  if (!isErr(progressResult)) {
    const { completedCount } = progressResult.data
    // Users can access all completed steps + the next immediate step
    // So if 2 steps are completed (index 0 and 1), they can access index 2 (step 3)
    maxReachableStepIndex = completedCount
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-6 gap-6">
      <TeamFormsStepper
        steps={teamFormSteps}
        maxReachableStepIndex={maxReachableStepIndex}
      />
      <div className="flex-1 container max-w-3xl mx-auto px-4">
        <Card className="shadow-none md:shadow-sm">{children}</Card>
      </div>
    </div>
  )
}
