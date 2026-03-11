import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/services/weekend'
import { StatementOfBeliefForm } from '@/components/team-forms/statement-of-belief-form'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { formatWeekendTitle } from '@/lib/weekend'

export default async function StatementOfBeliefPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
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

  if (isErr(weekendResult)) {
    redirect('/')
  }

  const weekend = weekendResult.data
  const weekendTitle = formatWeekendTitle(weekend)
  const userName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <StatementOfBeliefForm
      userName={userName}
      weekendTitle={weekendTitle}
      groupMemberId={user.teamMemberInfo.groupMemberId}
    />
  )
}
