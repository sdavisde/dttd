import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/services/weekend'
import { CommitmentFormComponent } from '@/components/team-forms/commitment-form-component'
import { Results } from '@/lib/results'
import { isNil } from 'lodash'
import { formatWeekendTitle } from '@/lib/weekend'
import { getTeamFee } from '@/services/payment'

export default async function CommitmentFormPage() {
  const userResult = await getLoggedInUser()

  if (Results.isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.teamMemberInfo)) {
    redirect('/')
  }

  const weekendId = user.teamMemberInfo.assignments[0]?.weekend_id
  if (isNil(weekendId)) {
    redirect('/')
  }

  const weekendResult = await getWeekendById(weekendId)

  if (Results.isErr(weekendResult)) {
    redirect('/')
  }

  const weekend = weekendResult.data
  const weekendTitle = formatWeekendTitle(weekend)
  const userName = `${user.firstName} ${user.lastName}`.trim()
  const userRole = user.teamMemberInfo.assignments[0]?.cha_role ?? 'Team Member'
  const teamFee = await getTeamFee()
  const teamFeeAmount = Results.unwrapOr(teamFee, null)?.unitAmount ?? null
  const teamFeeDollars = isNil(teamFeeAmount) ? null : teamFeeAmount / 100

  return (
    <CommitmentFormComponent
      userName={userName}
      weekendTitle={weekendTitle}
      userRole={userRole}
      groupMemberId={user.teamMemberInfo.groupMemberId}
      teamFeeAmount={teamFeeDollars}
    />
  )
}
