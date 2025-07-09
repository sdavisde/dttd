import { Container, Paper } from "@mui/material";
import { permissionLock } from '@/lib/security';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/user';
import { getRoles } from '@/actions/roles';
import { isErr } from '@/lib/results';
import Roles from "@/app/admin-portal/roles/components/Roles";

export default async function RolesPage() {
  const user = await getUser();

  try {
    if (!user) {
      throw new Error('User not found');
    }
    permissionLock(['ROLES_MANAGEMENT'])(user);
  } catch (error) {
    redirect('/');
  }

  // Fetch roles
  const rolesResult = await getRoles();
  
  if (isErr(rolesResult)) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3}>
          <Roles 
            initialRoles={[]} 
            error={rolesResult.error.message}
          />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3}>
        <Roles 
          initialRoles={rolesResult.data} 
        />
      </Paper>
    </Container>
  );
}
