'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, TextField, Typography, Divider, Alert, CircularProgress } from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSuccess?: () => void
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    logger.info('handling email auth', { mode, email, password })

    try {
      if (mode === 'login') {
        logger.info('signing in with email', { email, password })
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onSuccess?.()
        router.refresh()
      } else {
        logger.info('signing up with email', { email, password })
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        // Show confirmation message
        setMessage('Please check your email for the confirmation link to complete your registration.')

        // Clear the form
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      logger.info('signing in with google')
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
      <Typography
        variant='h5'
        component='h1'
        textAlign='center'
        gutterBottom
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Typography>

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

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Button
        variant='outlined'
        startIcon={<GoogleIcon />}
        onClick={handleGoogleAuth}
        fullWidth
      >
        Continue with Google
      </Button>

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
