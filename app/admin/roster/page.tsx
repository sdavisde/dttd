import { Typography } from '@/components/ui/typography'
import { RosterTable } from './roster-table'
import { logger } from '@/lib/logger'
import { User } from '@/lib/users/types'
import { getActiveWeekends } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { getUsers } from '@/actions/users'

async function getRoster(weekendId: string): Promise<Array<User>> {
  const usersResult = await getUsers()
  if (isErr(usersResult)) {
    logger.error('Failed to fetch users')
    return []
  }
  const users = usersResult.data

  return users.filter((user) => user.team_member_info?.weekend_id === weekendId)
}

export default async function RosterPage() {
  const activeWeekends = await getActiveWeekends()
  if (isErr(activeWeekends)) {
    logger.error('Failed to find active weekends')
    return <div>Failed to find active weekends</div>
  }

  const mensWeekend = activeWeekends.data.MENS
  const womensWeekend = activeWeekends.data.WOMENS

  if (!mensWeekend || !womensWeekend) {
    logger.error('Failed to find upcoming mens or womens weekend')
    return <div>Failed to find upcoming mens or womens weekend</div>
  }

  const mensRoster = await getRoster(mensWeekend.id)
  const womensRoster = await getRoster(womensWeekend.id)

  // Get all users for roster management
  const allUsersResult = await getUsers()
  const allUsers = isErr(allUsersResult) ? [] : allUsersResult.data

  return (
    <div className='container mx-auto max-w-5xl mt-8 px-4'>
      <Typography variant='h3'>Roster</Typography>
      <Typography variant='p'>
        This is the roster page. Here you can view the roster for the current weekend.
      </Typography>
      <div className='flex flex-row gap-4 mt-4 w-full'>
        <div className='flex flex-col gap-4 w-full'>
          <Typography variant='h5'>Mens Roster</Typography>

          <RosterTable
            roster={mensRoster}
            type='mens'
            weekendId={mensWeekend.id}
            allUsers={allUsers}
          />
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <Typography variant='h5'>Womens Roster</Typography>

          <RosterTable
            roster={womensRoster}
            type='womens'
            weekendId={womensWeekend.id}
            allUsers={allUsers}
          />
        </div>
      </div>
    </div>
  )
}
