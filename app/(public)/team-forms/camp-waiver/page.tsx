import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { CampWaiverForm } from '@/components/team-forms/camp-waiver-form'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'

export default async function CampWaiverPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.teamMemberInfo)) {
    redirect('/')
  }

  const userName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <CampWaiverForm userName={userName} rosterId={user.teamMemberInfo.id} />
  )
}
