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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  FormDescription,
} from '@/components/ui/form'
import { CHARole, Rollo } from '@/lib/weekend/types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [roleComboboxOpen, setRoleComboboxOpen] = useState(false)

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
    setRoleComboboxOpen(false)
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
            <FormField
              control={form.control}
              name="cha_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CHA Role *</FormLabel>
                  <Popover
                    open={roleComboboxOpen}
                    onOpenChange={setRoleComboboxOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleComboboxOpen}
                          className="w-full justify-between"
                        >
                          {field.value ? field.value : 'Select a role...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search roles..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No role found.</CommandEmpty>
                          <CommandGroup>
                            {Object.values(CHARole).map((role) => (
                              <CommandItem
                                key={role}
                                value={role}
                                onSelect={() => {
                                  field.onChange(role)
                                  setRoleComboboxOpen(false)
                                }}
                              >
                                {role}
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    field.value === role
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Rollo field for TABLE_LEADER */}
            {[
              CHARole.TABLE_LEADER.toString(),
              CHARole.SPIRITUAL_DIRECTOR.toString(),
              CHARole.HEAD_SPIRITUAL_DIRECTOR.toString(),
            ].includes(selectedRole) && (
              <FormField
                control={form.control}
                name="rollo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rollo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a rollo or Silent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'Silent'}>Silent</SelectItem>
                        {Object.values(Rollo).map((rollo) => (
                          <SelectItem key={rollo} value={rollo}>
                            {rollo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What Rollo is this team member going to do? Select Silent
                      if they are not doing a Rollo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

        <SheetFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
