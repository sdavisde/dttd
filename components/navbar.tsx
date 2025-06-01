'use client'

import * as React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Link, Container, IconButton, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useRouter } from 'next/navigation'

const pages = ['Events', 'Sponsor', 'Resources', 'About']

export default function Navbar() {
  const router = useRouter()
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  return (
    <AppBar
      position='static'
      sx={{ bgcolor: 'primary.main', boxShadow: 2 }}
    >
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Typography
            variant='h6'
            noWrap
            component={Link}
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Dusty Trails Tres Dias
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size='large'
              aria-label='menu'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                >
                  <Link
                    href={`/${page.toLowerCase()}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography textAlign='center'>{page}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant='h5'
            noWrap
            component={Link}
            href='/'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Dusty Trails Tres Dias
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link
                key={page}
                href={`/${page.toLowerCase()}`}
                sx={{ textDecoration: 'none' }}
              >
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              </Link>
            ))}
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Link
              href='/login'
              sx={{ textDecoration: 'none' }}
            >
              <Button
                variant='outlined'
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Sign In
              </Button>
            </Link>
            <Link
              href='/register'
              sx={{ textDecoration: 'none' }}
            >
              <Button
                variant='contained'
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Register
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
