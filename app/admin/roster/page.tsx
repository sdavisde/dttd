import { Container, Stack, Typography } from '@mui/material'
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

  return (
    <Container
      maxWidth='lg'
      sx={{ marginTop: 4 }}
    >
      <Typography variant='h3'>Roster</Typography>
      <Typography variant='body1'>
        This is the roster page. Here you can view the roster for the current weekend.
      </Typography>
      <Stack
        direction='row'
        spacing={2}
        className='mt-4'
        width='100%'
      >
        <Stack
          direction='column'
          spacing={2}
          width='100%'
        >
          <Typography variant='h5'>Mens Roster</Typography>

          <RosterTable
            roster={mensRoster}
            type='mens'
            weekendId={mensWeekend.id}
          />
        </Stack>
        <Stack
          direction='column'
          spacing={2}
          width='100%'
        >
          <Typography variant='h5'>Womens Roster</Typography>

          <RosterTable
            roster={womensRoster}
            type='womens'
            weekendId={womensWeekend.id}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
