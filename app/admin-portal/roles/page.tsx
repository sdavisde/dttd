import { Container, Paper } from "@mui/material";
import { permissionLock } from '@/lib/security';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/user';
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

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3}>
        <Roles />
      </Paper>
    </Container>
  );
}
