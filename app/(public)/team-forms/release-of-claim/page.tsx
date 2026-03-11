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

  // Use the first assignment's roster ID to fetch special_needs (stored on weekend_roster)
  const firstRosterId = user.teamMemberInfo.assignments[0]?.id
  const specialNeedsResult = firstRosterId
    ? await getRosterSpecialNeeds(firstRosterId)
    : null

  return (
    <ReleaseOfClaimForm
      groupMemberId={user.teamMemberInfo.groupMemberId}
      initialSpecialNeeds={
        specialNeedsResult
          ? (unwrapOr(specialNeedsResult, null) ?? undefined)
          : undefined
      }
    />
  )
}
