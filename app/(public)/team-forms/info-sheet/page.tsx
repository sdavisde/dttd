import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/auth'
import { TeamInfoForm } from '@/components/team-forms/team-info-form'
import { isErr, unwrap } from '@/lib/results'
import { isNil } from 'lodash'
import { getUserServiceHistory } from '@/actions/user-experience'
import { WeekendReference } from '@/lib/weekend/weekend-reference'
import { experienceToFormValues } from '@/lib/users/experience'
import { createClient } from '@/lib/supabase/server'

export default async function TeamInfoPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  // Verify user is on an active weekend roster
  if (isNil(user.teamMemberInfo)) {
    // Spec says: redirect to homepage with error toast if not assigned.
    // For now, simple redirect. Toast is client-side, would need query param or similar.
    redirect('/?error=UserNotOnRoster')
  }

  // Fetch medical info from weekend_roster
  const supabase = await createClient()
  const { data: rosterData } = await supabase
    .from('weekend_roster')
    .select(
      'emergency_contact_name, emergency_contact_phone, medical_conditions'
    )
    .eq('id', user.teamMemberInfo.id)
    .single()

  const initialMedicalInfo = {
    emergency_contact_name: rosterData?.emergency_contact_name ?? '',
    emergency_contact_phone: rosterData?.emergency_contact_phone ?? '',
    medical_conditions: rosterData?.medical_conditions ?? '',
  }

  const serviceHistoryResult = await getUserServiceHistory(user.id)
  const experience = experienceToFormValues(
    unwrap(serviceHistoryResult).experience
  )
  const attendedWeekendReference = !isNil(
    user.communityInformation.weekendAttended
  )
    ? WeekendReference.fromString(
        user.communityInformation.weekendAttended
      ).toJSON()
    : null

  const basicInfo = {
    church_affiliation: user.communityInformation.churchAffiliation ?? '',
    weekend_attended: attendedWeekendReference ?? {
      community: '',
      weekend_number: '',
    },
    essentials_training_date: user.communityInformation.essentialsTrainingDate
      ? new Date(user.communityInformation.essentialsTrainingDate)
      : undefined,
    special_gifts_and_skills:
      user.communityInformation.specialGiftsAndSkills ?? [],
  }

  return (
    <TeamInfoForm
      userId={user.id}
      rosterId={user.teamMemberInfo.id}
      savedAddress={user.address}
      initialBasicInfo={basicInfo}
      initialServiceHistory={experience}
      initialMedicalInfo={initialMedicalInfo}
    />
  )
}
