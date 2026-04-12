'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildUrlWithRedirect } from '@/lib/url'
import AuthModeToggle from './AuthModeToggle'
import PasswordInput from './PasswordInput'
import RegistrationFields from './RegistrationFields'
import { isNil } from 'lodash'

interface AuthFormProps {
  onSuccess?: () => void
  redirectTo?: string
  defaultMode?: 'login' | 'register'
}

export default function AuthForm({
  onSuccess,
  redirectTo,
  defaultMode = 'login',
}: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!isNil(error)) throw error
        onSuccess?.()
        router.refresh()
      } else {
        if (isNil(gender)) throw new Error('Please select your gender')

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

        if (!isNil(error)) throw error

        // Sign in the user immediately after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!isNil(signInError)) throw signInError

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
      if (!isNil(error)) throw error
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <form
      onSubmit={handleEmailAuth}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6"
    >
      <AuthModeToggle mode={mode} onModeChange={setMode} />

      {!isNil(error) && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isNil(message) && (
        <Alert variant="info">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {mode === 'register' && (
        <RegistrationFields
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          gender={gender}
          setGender={setGender}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete={mode === 'login' ? 'email' : 'email'}
            className="pl-9"
            required
          />
        </div>
      </div>

      <PasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        required
        helpText={
          mode === 'register'
            ? 'Password must be at least 6 characters'
            : undefined
        }
      />

      {mode === 'register' && (
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
        />
      )}

      {mode === 'login' && (
        <div className="text-right">
          <Button
            type="button"
            href="/forgot-password"
            variant="link"
            className="p-0 h-auto text-sm text-blue-600"
          >
            Forgot your password?
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full mt-4" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      {/* <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full"
      >
        Continue with Google
      </Button> */}

      <p className="text-center text-sm text-gray-600 mt-4">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <a href={buildUrlWithRedirect('/join', redirectTo)}>Create one</a>
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <a href={buildUrlWithRedirect('/login', redirectTo)}>Sign in</a>
            </Button>
          </>
        )}
      </p>
    </form>
  )
}
