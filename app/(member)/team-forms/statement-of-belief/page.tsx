import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { StatementOfBeliefForm } from '@/components/team-forms/statement-of-belief-form'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { formatTeamMemberTitle } from '@/lib/weekend'

export default async function StatementOfBeliefPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  if (isNil(user.teamMemberInfo)) {
    redirect('/')
  }

  const weekendTitle = formatTeamMemberTitle(user.teamMemberInfo)
  const userName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <StatementOfBeliefForm
      userName={userName}
      weekendTitle={weekendTitle}
      groupMemberId={user.teamMemberInfo.groupMemberId}
    />
  )
}
