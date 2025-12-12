import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
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
    if (isNil(user.team_member_info)) {
        redirect('/')
    }

    const userName = `${user.first_name} ${user.last_name}`.trim()

    return <CampWaiverForm userName={userName} rosterId={user.team_member_info.id} />
}
