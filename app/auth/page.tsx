import { Container, Paper } from "@mui/material";
import Roles from "@/components/auth/roles/Roles";

export default function AuthPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3}>
        <Roles />
      </Paper>
    </Container>
  );
}
