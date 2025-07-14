'use client'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material'
import Select from 'react-select'
import { CHARole } from '@/lib/weekend/types'
import { Tables } from '@/database.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormEvent } from 'react'
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
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      userId: '',
      role: '',
    },
    resolver: zodResolver(addToRosterFormSchema),
  })

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
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle className='capitalize'>Add to {type} Roster</DialogTitle>
      <DialogContent sx={{ paddingBottom: 2 }}>
        <DialogContentText>
          Choose a member of the DTTD community and their role on the weekend to add them to the {type} roster.
        </DialogContentText>
        <form className='space-y-4 my-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>User *</label>
            <Select
              options={users.map((user) => ({
                value: user?.id,
                label: `${user?.first_name} ${user?.last_name}`,
              }))}
              placeholder='Select a user'
              onChange={(option) => setValue('userId', option?.value || '')}
              isClearable
              isSearchable
              className='w-full'
              menuPortalTarget={document?.body}
              menuPosition='fixed'
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
            {errors.userId && (
              <Typography
                variant='body1'
                color='error'
              >
                {errors.userId.message}
              </Typography>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Role *</label>
            <Select
              options={Object.values(CHARole).map((role) => ({
                value: role,
                label: role.replaceAll('_', ' '),
              }))}
              placeholder='Select a role'
              onChange={(option) => setValue('role', option?.value || '')}
              isClearable
              isSearchable
              className='w-full'
              formatOptionLabel={(option) => <span className='capitalize'>{option.label}</span>}
              menuPortalTarget={document?.body}
              menuPosition='fixed'
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
            {errors.role && (
              <Typography
                variant='body1'
                color='error'
              >
                {errors.role.message}
              </Typography>
            )}
          </div>

          {errors.root && (
            <Typography
              key={errors.root.message}
              variant='body1'
              color='error'
            >
              {errors.root.message}
            </Typography>
          )}
        </form>
        <DialogActions className='w-full flex items-center !justify-between'>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            variant='contained'
          >
            Add to Roster
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
