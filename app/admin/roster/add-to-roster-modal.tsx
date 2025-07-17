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
import { createClient } from '@/lib/supabase/client'
import { isSupabaseError } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'

const addToRosterFormSchema = z.object({
  userId: z.string().min(1, { message: 'User is required' }),
  role: z.string().min(1, { message: 'Role is required' }),
})

type AddToRosterFormValues = z.infer<typeof addToRosterFormSchema>

type AddToRosterModalProps = {
  open: boolean
  handleClose: () => void
  type: 'mens' | 'womens'
  weekendId: string
  users: Array<Tables<'users'> | null>
}
export function AddToRosterModal({ open, handleClose, type, users, weekendId }: AddToRosterModalProps) {
  const router = useRouter()
  const form = useForm<AddToRosterFormValues>({
    defaultValues: {
      userId: '',
      role: '',
    },
    resolver: zodResolver(addToRosterFormSchema),
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
    reset,
  } = form

  const onClose = () => {
    reset()
    handleClose()
  }

  const onSubmit: SubmitHandler<AddToRosterFormValues> = async ({ userId, role }) => {
    const client = createClient()

    if (!userId) {
      setError('userId', { message: 'User id missing' })
    }
    if (!role) {
      setError('role', { message: 'Role is missing' })
    }

    const { data, error } = await client
      .from('weekend_roster')
      .insert({
        weekend_id: weekendId,
        user_id: userId,
        status: 'awaiting_payment',
        cha_role: role,
      })
      .select()

    if (isSupabaseError(error)) {
      logger.error(error, '💢 failed to add user to roster')
    }

    router.refresh()
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle className='capitalize'>Add to {type} Roster</SheetTitle>
          <SheetDescription>
            Choose a member of the DTTD community and their role on the weekend to add them to the {type} roster.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 py-4'>
            <FormField
              control={form.control}
              name='userId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a user' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user?.id} value={user?.id || ''}>
                          {user?.first_name} {user?.last_name}
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
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CHARole).map((role) => (
                        <SelectItem key={role} value={role}>
                          <span className='capitalize'>{role.replaceAll('_', ' ')}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add to Roster'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
