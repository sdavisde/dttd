'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from './PasswordInput'
import Link from 'next/link'

interface ResetPasswordFormProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ResetPasswordForm({ searchParams }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setHasValidSession(true)
        } else {
          // Check if we have a hash fragment with tokens (from email link)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          if (accessToken && refreshToken) {
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            
            if (error) {
              setError('Invalid or expired reset link. Please request a new password reset.')
            } else if (data.session) {
              setHasValidSession(true)
            }
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        }
      } catch (error) {
        setError('An error occurred while validating your reset link.')
      } finally {
        setSessionLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setPasswordReset(true)
        
        // Sign out the user after password reset to force fresh login
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/login?message=Password reset successful. Please log in with your new password.')
        }, 3000)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-600">Validating reset link...</p>
      </div>
    )
  }

  if (!hasValidSession) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 text-sm">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Please request a new password reset link.'}
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full mt-4">
          <Link href="/forgot-password">
            Request New Reset Link
          </Link>
        </Button>

        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">
            Back to Login
          </Link>
        </Button>
      </div>
    )
  }

  if (passwordReset) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6">
        <div className="text-center mb-4">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Password Reset Successfully
          </h2>
          <p className="text-gray-600 text-sm">
            Your password has been updated. You will be redirected to the login page shortly.
          </p>
        </div>

        <Alert variant="success">
          <AlertDescription>
            Redirecting to login page in a few seconds...
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full mt-4">
          <Link href="/login">
            Go to Login Now
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reset your password
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PasswordInput
        id="password"
        label="New password"
        value={password}
        onChange={setPassword}
        required
        helpText="Password must be at least 6 characters"
        disabled={loading}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        disabled={loading}
      />

      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={loading || !password || !confirmPassword}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password...
          </>
        ) : (
          'Update password'
        )}
      </Button>

      <Button variant="ghost" asChild className="w-full mt-2">
        <Link href="/login">
          Cancel and return to login
        </Link>
      </Button>
    </form>
  )
}