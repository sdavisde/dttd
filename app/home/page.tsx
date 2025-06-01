import { Container, Typography, Box, Button } from '@mui/material'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ my: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Welcome to Your DTTD Dashboard
        </Typography>

        <Typography
          variant='body1'
          paragraph
        >
          This is your personal space in the Dusty Trails Tres Dias community. Here you'll find important information,
          updates, and resources.
        </Typography>

        <Button
          variant='outlined'
          color='primary'
          onClick={handleSignOut}
          sx={{ mt: 2 }}
        >
          Sign Out
        </Button>
      </Box>
    </Container>
  )
}
