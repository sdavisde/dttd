'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container, Box, Typography, TextField, Button, Paper, Tabs, Tab, Alert } from '@mui/material'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function Join() {
  const [tab, setTab] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const handleLogin = async (data: LoginFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      router.push('/home')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create user profile in the database
      const { error: profileError } = await supabase.from('users').insert([
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      ])

      if (profileError) throw profileError

      router.push('/home')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <Container maxWidth='sm'>
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            align='center'
          >
            Welcome to DTTD
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label='Login' />
            <Tab label='Register' />
          </Tabs>

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {tab === 0 ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)}>
              <TextField
                fullWidth
                label='Email'
                margin='normal'
                {...loginForm.register('email')}
                error={!!loginForm.formState.errors.email}
                helperText={loginForm.formState.errors.email?.message}
              />
              <TextField
                fullWidth
                label='Password'
                type='password'
                margin='normal'
                {...loginForm.register('password')}
                error={!!loginForm.formState.errors.password}
                helperText={loginForm.formState.errors.password?.message}
              />
              <Button
                fullWidth
                variant='contained'
                type='submit'
                sx={{ mt: 3 }}
              >
                Login
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)}>
              <TextField
                fullWidth
                label='First Name'
                margin='normal'
                {...registerForm.register('firstName')}
                error={!!registerForm.formState.errors.firstName}
                helperText={registerForm.formState.errors.firstName?.message}
              />
              <TextField
                fullWidth
                label='Last Name'
                margin='normal'
                {...registerForm.register('lastName')}
                error={!!registerForm.formState.errors.lastName}
                helperText={registerForm.formState.errors.lastName?.message}
              />
              <TextField
                fullWidth
                label='Email'
                margin='normal'
                {...registerForm.register('email')}
                error={!!registerForm.formState.errors.email}
                helperText={registerForm.formState.errors.email?.message}
              />
              <TextField
                fullWidth
                label='Password'
                type='password'
                margin='normal'
                {...registerForm.register('password')}
                error={!!registerForm.formState.errors.password}
                helperText={registerForm.formState.errors.password?.message}
              />
              <Button
                fullWidth
                variant='contained'
                type='submit'
                sx={{ mt: 3 }}
              >
                Register
              </Button>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  )
}
