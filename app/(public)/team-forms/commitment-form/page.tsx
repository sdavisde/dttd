import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { CommitmentFormComponent } from '@/components/team-forms/commitment-form-component'
import { Results } from '@/lib/results'
import { isNil } from 'lodash'
import { getTeamFee } from '@/services/payment'
import { formatTeamMemberTitle, formatTeamMemberRole } from '@/lib/weekend'

export default async function CommitmentFormPage() {
  const userResult = await getLoggedInUser()

  if (Results.isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  if (isNil(user.teamMemberInfo)) {
    redirect('/')
  }

  const weekendTitle = formatTeamMemberTitle(user.teamMemberInfo)
  const userName = `${user.firstName} ${user.lastName}`.trim()
  const userRole = formatTeamMemberRole(user.teamMemberInfo)
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
