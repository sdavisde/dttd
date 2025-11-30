'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChaRoleField } from '@/components/weekend/cha-role-field'
import { RolloField } from '@/components/weekend/rollo-field'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const editTeamMemberFormSchema = z.object({
  status: z.string().min(1, { message: 'Status is required' }),
  cha_role: z.string().min(1, { message: 'Role is required' }),
  rollo: z.string().optional(),
})

type EditTeamMemberFormValues = z.infer<typeof editTeamMemberFormSchema>

type RosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
  rollo: string | null
  users: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone_number: string | null
  } | null
}

type EditTeamMemberModalProps = {
  open: boolean
  onClose: () => void
  rosterMember: RosterMember | null
}

const statusOptions = [
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'drop', label: 'Drop' },
]

export function EditTeamMemberModal({
  open,
  onClose,
  rosterMember,
}: EditTeamMemberModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditTeamMemberFormValues>({
    defaultValues: {
      status: rosterMember?.status || '',
      cha_role: rosterMember?.cha_role || '',
      rollo: rosterMember?.rollo || '',
    },
    resolver: zodResolver(editTeamMemberFormSchema),
  })

  const { handleSubmit, reset, setError, watch } = form
  const selectedRole = watch('cha_role')

  // Update form values when rosterMember changes
  React.useEffect(() => {
    if (rosterMember) {
      form.setValue('status', rosterMember.status || '')
      form.setValue('cha_role', rosterMember.cha_role || '')
      form.setValue('rollo', rosterMember.rollo || '')
    }
  }, [rosterMember, form])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit: SubmitHandler<EditTeamMemberFormValues> = async ({
    status,
    cha_role,
    rollo,
  }) => {
    if (!rosterMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    setIsSubmitting(true)

    try {
      const client = createClient()

      const { error } = await client
        .from('weekend_roster')
        .update({
          status,
          cha_role,
          rollo: rollo || null,
        })
        .eq('id', rosterMember.id)

      if (isSupabaseError(error)) {
        logger.error(`💢 failed to update roster member: ${error.message}`)
        setError('root', { message: 'Failed to update roster member' })
        return
      }

      router.refresh()
      handleClose()
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDrop = async () => {
    if (!rosterMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    setIsSubmitting(true)

    try {
      const client = createClient()

      const { error } = await client
        .from('weekend_roster')
        .update({ status: 'drop' })
        .eq('id', rosterMember.id)

      if (isSupabaseError(error)) {
        logger.error(`💢 failed to drop roster member: ${error.message}`)
        setError('root', { message: 'Failed to drop roster member' })
        return
      }

      router.refresh()
      handleClose()
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!rosterMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    setIsSubmitting(true)

    try {
      const client = createClient()

      const { error } = await client
        .from('weekend_roster')
        .delete()
        .eq('id', rosterMember.id)

      if (isSupabaseError(error)) {
        logger.error(`💢 failed to delete roster member: ${error.message}`)
        setError('root', { message: 'Failed to delete roster member' })
        return
      }

      router.refresh()
      handleClose()
    } catch (error) {
      setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!rosterMember) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="max-w-full w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
          <SheetDescription>
            Edit {rosterMember.users?.first_name}{' '}
            {rosterMember.users?.last_name}'s roster information.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            <ChaRoleField
              control={form.control}
              name="cha_role"
              label="CHA Role"
              placeholder="Select a role..."
              required
            />

            <RolloField
              control={form.control}
              name="rollo"
              selectedRole={selectedRole}
              placeholder="Select a rollo or Silent"
              silentLabel="Silent"
            />

            {/*<Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full"
              disabled={isSubmitting}
            >
              <Trash className="w-4 h-4 mr-2" />
              Remove from Roster
            </Button>*/}

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>

        <SheetFooter className="flex flex-col gap-3">
          {/* Drop Button - Full width and prominent */}
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={handleDrop}
            disabled={isSubmitting}
            className="w-full"
          >
            Drop Team Member
          </Button>

          {/* Action buttons row */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
