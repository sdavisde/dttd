import { Container, Paper } from '@mui/material'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/user'
import Users from './components/Users'

export default async function UsersPage() {
  const user = await getUser()

  try {
    if (!user) {
      throw new Error('User not found')
    }
    permissionLock(['USER_MANAGEMENT'])(user)
  } catch (error) {
    redirect('/')
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3}>
        <Users />
      </Paper>
    </Container>
  )
}