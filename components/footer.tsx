'use client'

import { Box, Container, Typography, Link as MuiLink, Stack, Divider } from '@mui/material'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component='footer'
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth='xl'>
        <Stack spacing={3}>
          {/* Main Footer Content */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {/* Mission Statement */}
            <Box>
              <Typography
                variant='h6'
                component='h3'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Our Mission
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ lineHeight: 1.6 }}
              >
                Being like-minded, having the same love, being one in spirit and of one mind.
                <br />
                <Typography
                  component='span'
                  variant='body2'
                  color='text.secondary'
                  sx={{ fontStyle: 'italic' }}
                >
                  Philippians 2:2
                </Typography>
              </Typography>
            </Box>

            {/* Community Information */}
            <Box>
              <Typography
                variant='h6'
                component='h3'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Community
              </Typography>
              <Stack spacing={1}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <MapPin size={16} />
                  Grace Church, Cameron, TX
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Mail size={16} />
                  <MuiLink
                    href='mailto:info@dustytrailstresdias.org'
                    color='inherit'
                    sx={{ textDecoration: 'none' }}
                  >
                    info@dustytrailstresdias.org
                  </MuiLink>
                </Typography>
              </Stack>
            </Box>

            {/* Quick Links */}
            <Box>
              <Typography
                variant='h6'
                component='h3'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <MuiLink
                  component={Link}
                  href='/sponsor'
                  color='text.secondary'
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Sponsor a Candidate
                </MuiLink>
                <MuiLink
                  component={Link}
                  href='/files'
                  color='text.secondary'
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Community Resources
                </MuiLink>
                <MuiLink
                  component={Link}
                  href='/settings'
                  color='text.secondary'
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Account Settings
                </MuiLink>
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Footer Bottom */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              © {currentYear} Dusty Trails Tres Dias. All rights reserved.
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              Made with{' '}
              <Heart
                size={14}
                color='#ef4444'
              />{' '}
              for our community
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
