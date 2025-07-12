import { Container } from '@mui/material'
import { Dashboard } from './dashboard'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/user'
import { TeamMember } from '@/lib/weekend/types'
import { isErr } from '@/lib/supabase/utils'

async function getUserRosterInfo(): Promise<TeamMember | null> {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  /**
   * Get the weekend roster info for the current user
   * for the upcoming weekend tied to this user
   */
  const { data, error } = await supabase
    .from('weekend_roster')
    .select(
      `
      *,
      weekends!inner(
        id,
        title,
        start_date,
        end_date,
        status,
        type
      ),
      users!inner(*)
    `
    )
    .eq('user_id', user.id)
    .in('weekends.status', ['pre-weekend', 'active'])
    .single()

  if (isErr(error)) {
    console.error('Error fetching user roster info:', error)
    return null
  }

  return data
}

export default async function Home() {
  const rosterInfo = await getUserRosterInfo()

  return (
    <Container maxWidth='lg'>
      <Dashboard rosterInfo={rosterInfo} />
    </Container>
  )
}
