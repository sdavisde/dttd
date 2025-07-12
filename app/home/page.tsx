import { Container } from '@mui/material'
import { Dashboard } from './dashboard'
import { createClient } from '@/lib/supabase/server'

async function getUpcomingWeekends() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('weekends').select('*').in('status', ['Pre-weekend', 'active'])

  if (error) {
    return []
  }

  return data
}

export default async function Home() {
  const upcomingWeekends = await getUpcomingWeekends()

  return (
    <Container maxWidth='lg'>
      <Dashboard weekends={upcomingWeekends} />
    </Container>
  )
}
