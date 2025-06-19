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
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/navigation'
import { Person, Logout, ExpandLess, ExpandMore } from '@mui/icons-material'
import { MouseEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '../auth/session-provider'

type NavElement = {
  name: string
  slug: string
  children?: NavElement[]
}

type NavbarClientProps = {
  navElements: NavElement[]
}

export function NavbarClient({ navElements }: NavbarClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, loading } = useSession()

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

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setMobileOpen(open)
  }

  const mobileNavContent = (
    <Box
      sx={{ width: 'auto', height: '100%' }}
      role='presentation'
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant='h6'
          component='h2'
        >
          Dusty Trails Tres Dias
        </Typography>
        <IconButton
          onClick={toggleDrawer(false)}
          edge='end'
          aria-label='close navigation'
        >
          <CloseIcon />
        </IconButton>
      </Box>
      {isAuthenticated && (
        <List sx={{ width: '100%', pt: 2 }}>
          {navElements.map((element) => (
            <ListItemButton
              key={element.name}
              component={Link}
              href={`/${element.slug}`}
              sx={{ textTransform: 'capitalize' }}
            >
              <ListItemText primary={element.name} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  )

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
              onClick={toggleDrawer(true)}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <SwipeableDrawer
              anchor='left'
              open={mobileOpen}
              onClose={toggleDrawer(false)}
              onOpen={toggleDrawer(true)}
              sx={{
                '& .MuiDrawer-paper': {
                  width: '85%',
                  maxWidth: '400px',
                  boxSizing: 'border-box',
                },
              }}
            >
              {mobileNavContent}
            </SwipeableDrawer>
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
            {isAuthenticated && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navElements.map((element) => (
                  <Button
                    key={element.name}
                    component={Link}
                    href={`/${element.slug}`}
                    sx={{
                      color: 'white',
                      textTransform: 'capitalize',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {element.name}
                  </Button>
                ))}
              </Box>
            )}
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
                  {/* <MenuItem onClick={handleCloseUserMenu}>
                    <Link href='/profile'>
                      <Typography textAlign='center'>Profile</Typography>
                    </Link>
                  </MenuItem> */}
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
