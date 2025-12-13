import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { TeamInfoForm } from '@/components/team-forms/team-info-form'
import { isErr, unwrap } from '@/lib/results'
import { isNil } from 'lodash'
import { getUserServiceHistory } from '@/actions/user-experience'
import { WeekendReference } from '@/lib/weekend/weekend-reference'
import { experienceToFormValues } from '@/lib/users/experience'

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

  const serviceHistoryResult = await getUserServiceHistory(user.id)
  const experience = experienceToFormValues(
    unwrap(serviceHistoryResult).experience
  )
  const attendedWeekendReference = !isNil(user.weekend_attended)
    ? WeekendReference.fromString(user.weekend_attended).toJSON()
    : null

  const basicInfo = {
    church_affiliation: user.church_affiliation ?? '',
    weekend_attended: attendedWeekendReference ?? {
      community: '',
      weekend_number: '',
    },
    essentials_training_date: user.essentials_training_date ?? '',
    special_gifts_and_skills: user.special_gifts_and_skills ?? [],
  }

  return (
    <TeamInfoForm
      userId={user.id}
      rosterId={user.team_member_info.id}
      savedAddress={user.address}
      initialBasicInfo={basicInfo}
      initialServiceHistory={experience}
    />
  )
}
