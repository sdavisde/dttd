import { Container, Paper } from '@mui/material'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import Roles from '@/app/admin/roles/components/Roles'
import { isErr } from '@/lib/results'

export default async function RolesPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['ROLES_MANAGEMENT'])(user)
  } catch (error) {
    redirect('/')
  }

  return (
    <Container
      maxWidth='md'
      sx={{ py: 8 }}
    >
      <Paper elevation={3}>
        <Roles />
      </Paper>
    </Container>
  )
}
