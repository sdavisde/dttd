'use client'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material'
import Select from 'react-select'
import { CHARole } from '@/lib/weekend/types'
import { Tables } from '@/database.types'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { isErr } from '@/lib/supabase/utils'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { TeamMember } from '@/lib/weekend/types'
import React from 'react'

const editRosterFormSchema = z.object({
  status: z.string().min(1, { message: 'Status is required' }),
  cha_role: z.string().min(1, { message: 'Role is required' }),
})

type EditRosterFormValues = z.infer<typeof editRosterFormSchema>

type EditRosterModalProps = {
  open: boolean
  handleClose: () => void
  rosterMember: TeamMember | null
}

const statusOptions = [
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EditRosterModal({ open, handleClose, rosterMember }: EditRosterModalProps) {
  const router = useRouter()
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      status: rosterMember?.status || '',
      cha_role: rosterMember?.cha_role || '',
    },
    resolver: zodResolver(editRosterFormSchema),
  })

  // Update form values when rosterMember changes
  React.useEffect(() => {
    if (rosterMember) {
      setValue('status', rosterMember.status || '')
      setValue('cha_role', rosterMember.cha_role || '')
    }
  }, [rosterMember, setValue])

  const onClose = () => {
    reset()
    handleClose()
  }

  const onSubmit: SubmitHandler<EditRosterFormValues> = async ({ status, cha_role }) => {
    if (!rosterMember) {
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
      .eq('id', rosterMember.id)
      .select()

    if (isErr(error)) {
      logger.error(error, '💢 failed to update roster member')
      setError('root', { message: 'Failed to update roster member' })
      return
    }

    router.refresh()
    onClose()
  }

  const handleDelete = async () => {
    if (!rosterMember) {
      setError('root', { message: 'No roster member selected' })
      return
    }

    const client = createClient()

    const { error } = await client.from('weekend_roster').delete().eq('id', rosterMember.id)

    if (isErr(error)) {
      logger.error(error, '💢 failed to delete roster member')
      setError('root', { message: 'Failed to delete roster member' })
      return
    }

    router.refresh()
    onClose()
  }

  if (!rosterMember) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Edit Roster Member</DialogTitle>
      <DialogContent sx={{ paddingBottom: 2 }}>
        <DialogContentText>
          Edit {rosterMember.users.first_name} {rosterMember.users.last_name}'s roster information.
        </DialogContentText>
        <form className='space-y-4 my-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Status *</label>
            <Select
              options={statusOptions}
              placeholder='Select a status'
              onChange={(option) => setValue('status', option?.value || '')}
              value={statusOptions.find((option) => option.value === watch('status'))}
              isClearable
              isSearchable
              className='w-full'
              menuPortalTarget={document.body}
              menuPosition='fixed'
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
            {errors.status && (
              <Typography
                variant='body1'
                color='error'
              >
                {errors.status.message}
              </Typography>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>CHA Role *</label>
            <Select
              options={Object.values(CHARole).map((role) => ({
                value: role,
                label: role.replaceAll('_', ' '),
              }))}
              placeholder='Select a role'
              onChange={(option) => setValue('cha_role', option?.value || '')}
              value={Object.values(CHARole)
                .map((role) => ({
                  value: role,
                  label: role.replaceAll('_', ' '),
                }))
                .find((option) => option.value === watch('cha_role'))}
              isClearable
              isSearchable
              className='w-full'
              formatOptionLabel={(option) => <span className='capitalize'>{option.label}</span>}
              menuPortalTarget={document.body}
              menuPosition='fixed'
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            />
            {errors.cha_role && (
              <Typography
                variant='body1'
                color='error'
              >
                {errors.cha_role.message}
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
          <Button
            onClick={handleDelete}
            color='error'
            variant='outlined'
          >
            Remove from Roster
          </Button>
          <div className='flex gap-2'>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              variant='contained'
            >
              Update Roster Member
            </Button>
          </div>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
