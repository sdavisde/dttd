import { Container, Paper } from '@mui/material'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import Users from './components/Users'
import { isErr } from '@/lib/results'

export default async function UsersPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['USER_MANAGEMENT'])(user)
  } catch (error) {
    redirect('/')
  }

  return (
    <Container
      maxWidth='md'
      sx={{ py: 8 }}
    >
      <Paper elevation={3}>
        <Users />
      </Paper>
    </Container>
  )
}
