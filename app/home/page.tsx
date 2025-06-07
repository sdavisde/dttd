import { Container, Typography, Box, Button } from '@mui/material'

export default function Home() {
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
          sx={{ mb: 4 }}
        >
          This is your personal space in the Dusty Trails Tres Dias community. Here you'll find important information,
          updates, and resources.
        </Typography>

        <Button href='/sponsor'>Sponsor Candidate</Button>
        <Button href='/review-candidate'>Review Candidate</Button>
      </Box>
    </Container>
  )
}
