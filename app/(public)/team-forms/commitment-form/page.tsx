import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getWeekendById } from '@/actions/weekend'
import { CommitmentFormComponent } from '@/components/team-forms/commitment-form-component'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { formatWeekendTitle } from '@/lib/weekend'

export default async function CommitmentFormPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.teamMemberInfo) || isNil(user.teamMemberInfo.weekend_id)) {
    redirect('/')
  }

  const weekendResult = await getWeekendById(user.teamMemberInfo.weekend_id)

  if (isErr(weekendResult)) {
    redirect('/')
  }

  const weekend = weekendResult.data
  const weekendTitle = formatWeekendTitle(weekend)
  const userName = `${user.firstName} ${user.lastName}`.trim()
  const userRole = user.teamMemberInfo.cha_role ?? 'Team Member'

  return (
    <CommitmentFormComponent
      userName={userName}
      weekendTitle={weekendTitle}
      userRole={userRole}
      rosterId={user.teamMemberInfo.id}
    />
  )
}
