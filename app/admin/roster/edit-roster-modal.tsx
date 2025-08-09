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
import React from 'react'
import { User } from '@/lib/users/types'
import { Trash } from 'lucide-react'

const editRosterFormSchema = z.object({
  status: z.string().min(1, { message: 'Status is required' }),
  cha_role: z.string().min(1, { message: 'Role is required' }),
})

type EditRosterFormValues = z.infer<typeof editRosterFormSchema>

type EditRosterModalProps = {
  open: boolean
  handleClose: () => void
  user: User | null
}

const statusOptions = [
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'drop', label: 'Drop' },
]

export function EditRosterModal({
  open,
  handleClose,
  user,
}: EditRosterModalProps) {
  const teamMember = user?.team_member_info
  const router = useRouter()
  const form = useForm<EditRosterFormValues>({
    defaultValues: {
      status: teamMember?.status || '',
      cha_role: teamMember?.cha_role || '',
    },
    resolver: zodResolver(editRosterFormSchema),
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
    reset,
  } = form

  // Update form values when rosterMember changes
  React.useEffect(() => {
    if (teamMember) {
      form.setValue('status', teamMember.status || '')
      form.setValue('cha_role', teamMember.cha_role || '')
    }
  }, [teamMember, form])

  const onClose = () => {
    reset()
    handleClose()
  }

  const onSubmit: SubmitHandler<EditRosterFormValues> = async ({
    status,
    cha_role,
  }) => {
    if (!teamMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    const client = createClient()

    const { data, error } = await client
      .from('weekend_roster')
      .update({
        status,
        cha_role,
      })
      .eq('id', teamMember.id)
      .select()

    if (isSupabaseError(error)) {
      logger.error(error, '💢 failed to update roster member')
      setError('root', { message: 'Failed to update roster member' })
      return
    }

    router.refresh()
    onClose()
  }

  const handleDelete = async () => {
    if (!teamMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    const client = createClient()

    const { error } = await client
      .from('weekend_roster')
      .delete()
      .eq('id', teamMember.id)

    if (isSupabaseError(error)) {
      logger.error(error, '💢 failed to delete roster member')
      setError('root', { message: 'Failed to delete roster member' })
      return
    }

    router.refresh()
    onClose()
  }

  if (!teamMember) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Roster Member</SheetTitle>
          <SheetDescription>
            Edit {user?.first_name} {user?.last_name}'s roster information.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4">
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
                          <span className="capitalize">
                            {role.replaceAll('_', ' ')}
                          </span>
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
            >
              <Trash className="" />
              Remove from Roster
            </Button>
          </form>
        </Form>

        <SheetFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Roster Member'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
