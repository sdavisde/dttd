import { createClient } from '@/lib/supabase/server'
import { Container, Stack, Typography } from '@mui/material'
import { isErr } from '@/lib/supabase/utils'
import { RosterTable } from './roster-table'

async function getMensRoster() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekend_roster')
    .select('*, weekends(id, title, start_date, end_date), users(*)')
    .eq('weekends.type', 'MENS')
    .in('weekends.status', ['pre-weekend', 'active'])
    .eq('users.gender', 'male')
    .not('users.id', 'is', null)

  if (isErr(error)) {
    console.error('Error fetching mens roster:', error)
    return []
  }

  return data
}

async function getWomensRoster() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('weekend_roster')
    .select('*, weekends(id, title, start_date, end_date), users!inner(*)')
    .eq('weekends.type', 'WOMENS')
    .in('weekends.status', ['pre-weekend', 'active'])
    .eq('users.gender', 'female')
    .not('users.id', 'is', null)

  if (isErr(error)) {
    console.error('Error fetching womens roster:', error)
    return []
  }

  return data
}

export default async function RosterPage() {
  const mensRoster = await getMensRoster()
  const womensRoster = await getWomensRoster()

  return (
    <Container maxWidth='lg'>
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
          />
        </Stack>
      </Stack>
    </Container>
  )
}
