'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/session-provider'
import { createClient } from '@/lib/supabase/client'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useSession()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      setFirstName(user.user_metadata?.first_name || '')
      setLastName(user.user_metadata?.last_name || '')
      setGender(user.user_metadata?.gender || '')
      setEmail(user.email || '')
    }
  }, [user, loading, isAuthenticated, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage(null)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          gender: gender,
        },
      })

      if (error) throw error

      setMessage('Profile updated successfully!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth='md'>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Container maxWidth='md'>
      <Box sx={{ my: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Profile
        </Typography>
        <Typography
          variant='subtitle1'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Manage your account information
        </Typography>

        <Paper sx={{ p: 4 }}>
          {message && (
            <Alert
              severity='success'
              sx={{ mb: 3 }}
              onClose={() => setMessage(null)}
            >
              {message}
            </Alert>
          )}

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box
            component='form'
            onSubmit={handleUpdateProfile}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              label='Email'
              type='email'
              value={email}
              disabled
              fullWidth
              helperText='Email cannot be changed'
            />

            <TextField
              label='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label='Last Name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
            />

            <FormControl
              fullWidth
              required
            >
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                label='Gender'
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value='male'>Male</MenuItem>
                <MenuItem value='female'>Female</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
                <MenuItem value='prefer-not-to-say'>Prefer not to say</MenuItem>
              </Select>
            </FormControl>

            <Button
              type='submit'
              variant='contained'
              disabled={isUpdating}
              sx={{ mt: 2 }}
            >
              {isUpdating ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
