import { Container, Paper } from '@mui/material'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <Container
      maxWidth='sm'
      sx={{ py: 8 }}
    >
      <Paper elevation={3}>
        <AuthForm mode='login' />
      </Paper>
    </Container>
  )
}
