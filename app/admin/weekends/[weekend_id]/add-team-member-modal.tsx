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
import { CHARole } from '@/lib/weekend/types'
import { Tables } from '@/database.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addUserToWeekendRoster } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const addTeamMemberFormSchema = z.object({
  userId: z.string().min(1, { message: 'User is required' }),
  role: z.string().min(1, { message: 'Role is required' }),
})

type AddTeamMemberFormValues = z.infer<typeof addTeamMemberFormSchema>

type AddTeamMemberModalProps = {
  open: boolean
  onClose: () => void
  weekendId: string
  weekendTitle: string
  users: Array<Tables<'users'>>
}

export function AddTeamMemberModal({
  open,
  onClose,
  weekendId,
  weekendTitle,
  users,
}: AddTeamMemberModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userComboboxOpen, setUserComboboxOpen] = useState(false)
  const [roleComboboxOpen, setRoleComboboxOpen] = useState(false)

  const form = useForm<AddTeamMemberFormValues>({
    defaultValues: {
      userId: '',
      role: '',
    },
    resolver: zodResolver(addTeamMemberFormSchema),
  })

  const { handleSubmit, reset, setError } = form

  const handleClose = () => {
    reset()
    setUserComboboxOpen(false)
    setRoleComboboxOpen(false)
    onClose()
  }

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const onSubmit: SubmitHandler<AddTeamMemberFormValues> = async ({
    userId,
    role,
  }) => {
    setIsSubmitting(true)

    try {
      const result = await addUserToWeekendRoster(weekendId, userId, role)

      if (isErr(result)) {
        setError('root', { message: result.error.message })
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

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Team Member</SheetTitle>
          <SheetDescription>
            Add a team member to {weekendTitle}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member *</FormLabel>
                  <Popover
                    open={userComboboxOpen}
                    onOpenChange={setUserComboboxOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userComboboxOpen}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? (() => {
                                const selectedUser = users.find(
                                  (user) => user.id === field.value
                                )
                                return selectedUser
                                  ? `${selectedUser.first_name} ${selectedUser.last_name}`
                                  : 'Select team member...'
                              })()
                            : 'Select team member...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search team members..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No team member found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.first_name} ${user.last_name} ${user.email}`}
                                onSelect={() => {
                                  field.onChange(user.id)
                                  setUserComboboxOpen(false)
                                }}
                              >
                                <div className="flex flex-col">
                                  <span>
                                    {user.first_name} {user.last_name}
                                  </span>
                                  {user.email && (
                                    <span className="text-sm text-muted-foreground">
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    field.value === user.id
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
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
                          {field.value
                            ? formatRole(field.value)
                            : 'Select a role...'}
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
                                value={formatRole(role)}
                                onSelect={() => {
                                  field.onChange(role)
                                  setRoleComboboxOpen(false)
                                }}
                              >
                                {formatRole(role)}
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

            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
          </form>
        </Form>

        <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add to Roster'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
