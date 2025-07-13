'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  onSuccess?: () => void
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onSuccess?.()
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              gender,
            },
          },
        })

        if (error) throw error

        // Sign in the user immediately after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        onSuccess?.()
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <Box
      component='form'
      onSubmit={handleEmailAuth}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={mode}
          onChange={(_, newValue) => setMode(newValue)}
          aria-label='basic tabs example'
          variant='fullWidth'
        >
          <Tab
            label='Sign In'
            value='login'
          />
          <Tab
            label='Create Account'
            value='register'
          />
        </Tabs>
      </Box>

      {error && (
        <Alert
          severity='error'
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity='success'
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      {mode === 'register' && (
        <>
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

          <FormControl fullWidth>
            <FormLabel id='demo-controlled-radio-buttons-group'>Gender</FormLabel>
            <RadioGroup
              aria-labelledby='demo-controlled-radio-buttons-group'
              name='controlled-radio-buttons-group'
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
            >
              <FormControlLabel
                value='male'
                control={<Radio />}
                label='Male'
              />
              <FormControlLabel
                value='female'
                control={<Radio />}
                label='Female'
              />
            </RadioGroup>
          </FormControl>
        </>
      )}

      <TextField
        label='Email'
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label='Password'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        helperText={mode === 'register' ? 'Password must be at least 6 characters' : undefined}
      />

      <Button
        type='submit'
        variant='contained'
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      {/* <Divider sx={{ my: 2 }}>OR</Divider>

      <Button
        variant='outlined'
        startIcon={<GoogleIcon />}
        onClick={handleGoogleAuth}
        fullWidth
      >
        Continue with Google
      </Button> */}

      <Typography
        variant='body2'
        textAlign='center'
        sx={{ mt: 2 }}
      >
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <Button
              component='a'
              href='/join'
              sx={{ textTransform: 'none', p: 0 }}
            >
              Create one
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button
              component='a'
              href='/login'
              sx={{ textTransform: 'none', p: 0 }}
            >
              Sign in
            </Button>
          </>
        )}
      </Typography>
    </Box>
  )
}
