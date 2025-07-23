'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2 } from 'lucide-react'
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
    <form
      onSubmit={handleEmailAuth}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6"
    >
      <div className="flex w-full border-b">
        <Button
          type="button"
          variant={mode === 'login' ? 'default' : 'ghost'}
          onClick={() => setMode('login')}
          className="flex-1 rounded-b-none"
        >
          Sign In
        </Button>
        <Button
          type="button"
          variant={mode === 'register' ? 'default' : 'ghost'}
          onClick={() => setMode('register')}
          className="flex-1 rounded-b-none"
        >
          Create Account
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {mode === 'register' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female')}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === 'register' && (
          <p className="text-sm text-gray-500">Password must be at least 6 characters</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full mt-4"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
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
            Don't have an account?{' '}
            <Button
              variant="link"
              asChild
              className="p-0 h-auto text-sm"
            >
              <a href="/join">Create one</a>
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button
              variant="link"
              asChild
              className="p-0 h-auto text-sm"
            >
              <a href="/login">Sign in</a>
            </Button>
          </>
        )}
      </p>
    </form>
  )
}
