'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/session-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

const profileFormSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().min(1),
})
type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfilePage() {
  const { user, isAuthenticated, loading: sessionLoading } = useSession()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email ?? '',
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      phoneNumber: user?.phone_number ?? '',
    },
  })

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      form.setValue('email', user.email ?? '')
      form.setValue('firstName', user.first_name ?? '')
      form.setValue('lastName', user.last_name ?? '')
      form.setValue('phoneNumber', user.phone_number ?? '')
    }
  }, [user, sessionLoading, isAuthenticated, router, form])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage(null)

    try {
      const supabase = createClient()

      if (!user?.id) {
        form.setError('root', { message: 'Looks like you have been automatically logged out. Please log in again.' })
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          // Intentionally do not set email here because it is readonly
          first_name: form.getValues('firstName'),
          last_name: form.getValues('lastName'),
          phone_number: form.getValues('phoneNumber'),
        })
        .eq('id', user?.id)

      if (error) {
        form.setError('root', { message: error.message })
      }

      setMessage('Profile updated successfully!')
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'An error occurred' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <Loader2 className='w-10 h-10 animate-spin' />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='max-w-lg mx-auto'>
      <div className='my-4'>
        <Typography variant='h1'>Profile</Typography>
        <Typography variant='p'>Manage your account information</Typography>

        <div className=''>
          {message && (
            <Alert
              variant='default'
              className='mb-3'
            >
              <CheckCircle2 />
              <AlertTitle>Profile updated successfully!</AlertTitle>
              <AlertDescription>Your profile has been updated successfully.</AlertDescription>
            </Alert>
          )}

          {Object.values(form.formState.errors).length > 0 && (
            <Alert
              variant='destructive'
              className='mb-3'
            >
              {Object.values(form.formState.errors)
                .map((error) => error.message)
                .join(', ')}
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={handleUpdateProfile}
              className='flex flex-col gap-3'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='example@gmail.com'
                        disabled
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Email cannot be changed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        required
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        required
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='123-456-7890'
                        required
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isUpdating}
                className='mt-2'
              >
                {isUpdating ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Update Profile'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
