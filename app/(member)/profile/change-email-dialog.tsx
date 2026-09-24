'use client'

import { useState } from 'react'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
import { requestEmailChange } from '@/actions/email-change'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const changeEmailSchema = z
  .object({
    newEmail: z.email('Please enter a valid email address'),
    confirmEmail: z.email('Please enter a valid email address'),
    currentPassword: z.string().min(1, 'Please enter your current password'),
  })
  .refine(
    (values) =>
      values.newEmail.toLowerCase() === values.confirmEmail.toLowerCase(),
    {
      message: 'Email addresses do not match',
      path: ['confirmEmail'],
    }
  )
type ChangeEmailValues = z.infer<typeof changeEmailSchema>

interface ChangeEmailDialogProps {
  currentEmail: string
  /** Called after the confirmation email has been sent successfully */
  onRequested?: () => void
}

/**
 * Dialog for requesting an account email change. The user re-authenticates
 * with their current password, then Supabase sends a confirmation link to the
 * new address; the change completes once that link is clicked.
 */
export function ChangeEmailDialog({
  currentEmail,
  onRequested,
}: ChangeEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '', confirmEmail: '', currentPassword: '' },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSent(false)
      form.reset()
    }
  }

  const onSubmit = async (values: ChangeEmailValues) => {
    setSubmitting(true)
    try {
      const result = await requestEmailChange(
        values.newEmail,
        values.currentPassword
      )
      if (isErr(result)) {
        toastError(result.error)
        return
      }

      setSent(true)
      onRequested?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Change
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            Enter your new email address and current password. We&apos;ll send a
            confirmation link to the new address to complete the change.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <>
            <Alert>
              <MailCheck />
              <AlertTitle>Confirmation link sent</AlertTitle>
              <AlertDescription>
                We sent a confirmation link to your new email address. Click it
                to complete the change. We also notified {currentEmail}.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send confirmation link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
