import { Container, Box } from '@mui/material'
import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/user'
import { getUsersWithRoles, getAllRoles } from '@/actions/users'
import { isErr } from '@/lib/results'
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

  // Fetch users with roles
  const usersResult = await getUsersWithRoles()
  
  // Fetch all roles
  const rolesResult = await getAllRoles()
  if (isErr(rolesResult)) {
    throw new Error(rolesResult.error.message)
  }

  // Handle the case where users can't be fetched (e.g., missing service role key)
  if (isErr(usersResult)) {
    return (
      <Container maxWidth='xl'>
        <Box sx={{ my: 4 }}>
          <Users 
            initialUsers={[]} 
            roles={rolesResult.data} 
            error={usersResult.error.message}
          />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ my: 4 }}>
        <Users 
          initialUsers={usersResult.data} 
          roles={rolesResult.data} 
        />
      </Box>
    </Container>
  )
}