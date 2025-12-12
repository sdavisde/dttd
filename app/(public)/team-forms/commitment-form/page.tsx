import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
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
    if (isNil(user.team_member_info) || isNil(user.team_member_info.weekend_id)) {
        redirect('/')
    }

    const weekendResult = await getWeekendById(user.team_member_info.weekend_id)

    if (isErr(weekendResult)) {
        redirect('/')
    }

    const weekend = weekendResult.data
    const weekendTitle = formatWeekendTitle(weekend)
    const userName = `${user.first_name} ${user.last_name}`.trim()
    const userRole = user.team_member_info.cha_role ?? 'Team Member'

    return (
        <CommitmentFormComponent
            userName={userName}
            weekendTitle={weekendTitle}
            userRole={userRole}
            rosterId={user.team_member_info.id}
        />
    )
}
