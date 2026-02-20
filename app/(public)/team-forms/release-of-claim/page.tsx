import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getRosterSpecialNeeds } from '@/services/weekend'
import { ReleaseOfClaimForm } from '@/components/team-forms/release-of-claim-form'
import { isErr, unwrapOr } from '@/lib/results'
import { isNil } from 'lodash'

export default async function ReleaseOfClaimPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.teamMemberInfo)) {
    redirect('/')
  }

  const specialNeedsResult = await getRosterSpecialNeeds(user.teamMemberInfo.id)

  return (
    <ReleaseOfClaimForm
      rosterId={user.teamMemberInfo.id}
      initialSpecialNeeds={unwrapOr(specialNeedsResult, null) ?? undefined}
    />
  )
}
