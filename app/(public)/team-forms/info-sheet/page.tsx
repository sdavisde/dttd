import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { TeamInfoForm } from '@/components/team-forms/team-info-form'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'

export default async function TeamInfoPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.team_member_info)) {
    // Spec says: redirect to homepage with error toast if not assigned.
    // For now, simple redirect. Toast is client-side, would need query param or similar.
    redirect('/?error=UserNotOnRoster')
  }

  return <TeamInfoForm userId={user.id} savedAddress={user.address} />
}
