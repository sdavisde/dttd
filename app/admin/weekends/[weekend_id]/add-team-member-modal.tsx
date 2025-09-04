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
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Command,
  CommandDialog,
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
import { CHARole, Rollo } from '@/lib/weekend/types'
import { Tables } from '@/database.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addUserToWeekendRoster } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const addTeamMemberFormSchema = z.object({
  userId: z.string().min(1, { message: 'User is required' }),
  role: z.string().min(1, { message: 'Role is required' }),
  rollo: z.string().optional(),
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
      rollo: undefined,
    },
    resolver: zodResolver(addTeamMemberFormSchema),
  })

  const { handleSubmit, reset, setError, watch } = form
  const selectedRole = watch('role')

  const handleClose = () => {
    reset()
    setUserComboboxOpen(false)
    setRoleComboboxOpen(false)
    onClose()
  }

  const onSubmit: SubmitHandler<AddTeamMemberFormValues> = async ({
    userId,
    role,
    rollo,
  }) => {
    setIsSubmitting(true)
    console.log(userId, role, rollo)

    try {
      const result = await addUserToWeekendRoster(
        weekendId,
        userId,
        role,
        rollo
      )

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

  console.log(form.formState.errors)

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="max-w-screen w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Team Member</SheetTitle>
          <SheetDescription>
            Add a team member to {weekendTitle}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 p-4 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Member *</FormLabel>
                    <Popover
                      open={userComboboxOpen}
                      onOpenChange={setUserComboboxOpen}
                      modal={true}
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rollo or SILENT" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SILENT">SILENT</SelectItem>
                          {Object.values(Rollo).map((rollo) => (
                            <SelectItem key={rollo} value={rollo}>
                              {rollo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        What Rollo is this team member going to do? Select
                        SILENT if they are not doing a Rollo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add to Roster'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
