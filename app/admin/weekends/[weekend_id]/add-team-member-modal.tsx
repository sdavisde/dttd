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
import { Tables } from '@/database.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addUserToWeekendRoster } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  users 
}: AddTeamMemberModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    onClose()
  }

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const onSubmit: SubmitHandler<AddTeamMemberFormValues> = async ({ userId, role }) => {
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                          {user.email && (
                            <span className="text-muted-foreground ml-2">
                              ({user.email})
                            </span>
                          )}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
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
            
            {form.formState.errors.root && (
              <div className="text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
            
            <SheetFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
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