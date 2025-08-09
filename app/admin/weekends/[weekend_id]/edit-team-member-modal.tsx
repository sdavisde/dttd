'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CHARole } from '@/lib/weekend/types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Trash } from 'lucide-react'

const editTeamMemberFormSchema = z.object({
  status: z.string().min(1, { message: 'Status is required' }),
  cha_role: z.string().min(1, { message: 'Role is required' }),
})

type EditTeamMemberFormValues = z.infer<typeof editTeamMemberFormSchema>

type RosterMember = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
  user_id: string | null
  created_at: string
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
    },
    resolver: zodResolver(editTeamMemberFormSchema),
  })

  const { handleSubmit, reset, setError } = form

  // Update form values when rosterMember changes
  React.useEffect(() => {
    if (rosterMember) {
      form.setValue('status', rosterMember.status || '')
      form.setValue('cha_role', rosterMember.cha_role || '')
    }
  }, [rosterMember, form])

  const handleClose = () => {
    reset()
    onClose()
  }

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const onSubmit: SubmitHandler<EditTeamMemberFormValues> = async ({
    status,
    cha_role,
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
        })
        .eq('id', rosterMember.id)

      if (isSupabaseError(error)) {
        logger.error(error, '💢 failed to update roster member')
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
        logger.error(error, '💢 failed to delete roster member')
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
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
          <SheetDescription>
            Edit {rosterMember.users?.first_name}{' '}
            {rosterMember.users?.last_name}'s roster information.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cha_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CHA Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CHARole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {formatRole(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="w-full"
              disabled={isSubmitting}
            >
              <Trash className="w-4 h-4 mr-2" />
              Remove from Roster
            </Button>

            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
          </form>
        </Form>

        <SheetFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
          >
            {isSubmitting ? 'Updating...' : 'Update Team Member'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
