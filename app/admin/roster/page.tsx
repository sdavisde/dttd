import { createClient } from '@/lib/supabase/server'
import { Container, Stack, Typography } from '@mui/material'
import { isErr } from '@/lib/supabase/utils'
import { RosterTable } from './roster-table'
import { logger } from '@/lib/logger'
import { TeamMember, Weekend } from '@/lib/weekend/types'

async function getUpcomingWeekend(type: 'MENS' | 'WOMENS'): Promise<Weekend | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('*')
    .eq('type', type)
    .in('status', ['pre-weekend', 'active'])
    .order('start_date', { ascending: false })
    .single()

  if (isErr(error)) {
    logger.error(error, `Failed to find upcoming ${type} weekend`)
    return null
  }

  if (!data) {
    logger.error(`Failed to find upcoming ${type} weekend record`)
    return null
  }

  return data
}

async function getRoster(weekendId: string, type: 'MENS' | 'WOMENS'): Promise<Array<TeamMember>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekend_roster')
    .select('*, users!inner(*)')
    .eq('weekend_id', weekendId)
    .eq('users.gender', type === 'MENS' ? 'male' : 'female')
    .not('users.id', 'is', null)

  if (isErr(error)) {
    logger.error(`Error fetching ${type} roster:`, error)
    return []
  }

  if (!data) {
    logger.error(`Could not find ${type} weekend_roster for weekend id ${weekendId}`)
    return []
  }

  return data
}

async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('users').select('*')
  if (isErr(error)) {
    console.error('Error fetching users:', error)
    return []
  }
  return data ?? []
}

export default async function RosterPage() {
  const mensWeekend = await getUpcomingWeekend('MENS')
  const womensWeekend = await getUpcomingWeekend('WOMENS')

  if (!mensWeekend || !womensWeekend) {
    logger.error('Failed to find upcoming mens or womens weekend')
    return <div>Failed to find upcoming mens or womens weekend</div>
  }

  const mensRoster = await getRoster(mensWeekend.id, 'MENS')
  const womensRoster = await getRoster(womensWeekend.id, 'WOMENS')
  const users = await getUsers()

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
            users={users}
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
            users={users}
            weekendId={womensWeekend.id}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
