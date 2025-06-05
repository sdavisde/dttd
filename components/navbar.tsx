'use client'

import * as React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useRouter } from 'next/navigation'
import { Person, Logout } from '@mui/icons-material'
import { MouseEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from './auth/session-provider'

const pages = [
  {
    label: 'Files',
    href: '/files',
    authenticationRequired: true,
  },
]

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const { user, isAuthenticated, loading } = useSession()

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    handleCloseUserMenu()
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
              {pages.map((page) => {
                if (page.authenticationRequired && !isAuthenticated) {
                  return null
                }

                return (
                  <MenuItem
                    key={page.label}
                    onClick={handleCloseNavMenu}
                  >
                    <Link
                      href={page.href}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography textAlign='center'>{page.label}</Typography>
                    </Link>
                  </MenuItem>
                )
              })}
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
            DTTD
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => {
              if (page.authenticationRequired && !isAuthenticated) {
                return null
              }

              return (
                <Link
                  key={page.label}
                  href={page.href}
                  sx={{ textDecoration: 'none' }}
                >
                  <Button
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.label}
                  </Button>
                </Link>
              )
            })}
          </Box>

          {/* Auth Buttons or Profile Menu */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {loading ? (
              <CircularProgress
                size={24}
                sx={{ color: 'white' }}
              />
            ) : user ? (
              <>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0 }}
                >
                  <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                    {user.email?.[0]?.toUpperCase() || <Person />}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Link href='/profile'>
                      <Typography textAlign='center'>Profile</Typography>
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography
                      textAlign='center'
                      className='flex items-center gap-2'
                    >
                      <Logout fontSize='small' />
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  variant='outlined'
                  sx={{ color: 'white', borderColor: 'white' }}
                  href='/login'
                >
                  Sign In
                </Button>

                <Button
                  component={Link}
                  variant='contained'
                  sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  href='/join'
                  className='flex gap-2'
                >
                  <Person />
                  <span>Join Community</span>
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
