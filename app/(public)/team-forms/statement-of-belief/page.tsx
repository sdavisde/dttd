import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { getWeekendById } from '@/actions/weekend'
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

    return <StatementOfBeliefForm userName={userName} weekendTitle={weekendTitle} />
}
