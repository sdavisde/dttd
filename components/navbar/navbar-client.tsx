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
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useRouter } from 'next/navigation'
import { Person, Logout, ExpandLess, ExpandMore } from '@mui/icons-material'
import { MouseEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '../auth/session-provider'

type Folder = {
  name: string
  slug: string
}

type Bucket = {
  name: string
  folders: Folder[]
}

type NavbarClientProps = {
  bucketStructure: Bucket[]
}

export function NavbarClient({ bucketStructure }: NavbarClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null)
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

  const handleBucketClick = (bucketName: string) => {
    setExpandedBucket(expandedBucket === bucketName ? null : bucketName)
  }

  const renderBucketMenu = (bucket: Bucket) => (
    <React.Fragment key={bucket.name}>
      <ListItemButton onClick={() => handleBucketClick(bucket.name)}>
        <ListItemText primary={bucket.name} />
        {expandedBucket === bucket.name ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse
        in={expandedBucket === bucket.name}
        timeout='auto'
        unmountOnExit
      >
        <List
          component='div'
          disablePadding
        >
          {bucket.folders.map((folder) => (
            <ListItemButton
              key={folder.slug}
              sx={{ pl: 4 }}
              component={Link}
              href={`/files/${folder.slug}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <ListItemText primary={folder.name} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </React.Fragment>
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
              {isAuthenticated &&
                bucketStructure.map((bucket) => (
                  <MenuItem
                    key={bucket.name}
                    onClick={handleCloseNavMenu}
                  >
                    <List sx={{ width: '100%' }}>{renderBucketMenu(bucket)}</List>
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
            DTTD
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {isAuthenticated && (
              <List sx={{ display: 'flex', flexDirection: 'row' }}>
                {bucketStructure.map((bucket) => (
                  <Box
                    key={bucket.name}
                    sx={{ position: 'relative' }}
                  >
                    <Button
                      onClick={() => handleBucketClick(bucket.name)}
                      sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                      {bucket.name}
                      {expandedBucket === bucket.name ? <ExpandLess /> : <ExpandMore />}
                    </Button>
                    {expandedBucket === bucket.name && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          borderRadius: 1,
                          zIndex: 1,
                        }}
                      >
                        {bucket.folders.map((folder) => (
                          <Button
                            key={folder.name}
                            component={Link}
                            href={`/files/${folder.slug}`}
                            sx={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              px: 2,
                              py: 1,
                              color: 'text.primary',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {folder.name}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </List>
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
