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
import { Form } from '@/components/ui/form'
import { ChaRoleField } from '@/components/weekend/cha-role-field'
import { RolloField } from '@/components/weekend/rollo-field'
import { AutoSaveStatusIndicator } from '@/components/auto-save/auto-save-status'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateWeekendRosterMember } from '@/services/weekend'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { isNil } from 'lodash'

// Status isn't edited here (only via Drop), so it isn't part of the form.
const editTeamMemberFormSchema = z.object({
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

export function EditTeamMemberModal({
  open,
  onClose,
  rosterMember,
}: EditTeamMemberModalProps) {
  if (isNil(rosterMember)) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="max-w-full w-[400px] sm:w-[540px]">
        {/* Keyed per member so each one starts from its own saved values. */}
        <EditTeamMemberBody
          key={rosterMember.id}
          rosterMember={rosterMember}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  )
}

/** Role and rollo save as soon as they change; dropping stays a deliberate button. */
function EditTeamMemberBody({
  rosterMember,
  onClose,
}: {
  rosterMember: RosterMember
  onClose: () => void
}) {
  const router = useRouter()
  const [isDropping, setIsDropping] = useState(false)

  const form = useForm<EditTeamMemberFormValues>({
    defaultValues: {
      cha_role: rosterMember.cha_role ?? '',
      rollo: rosterMember.rollo ?? '',
    },
    resolver: zodResolver(editTeamMemberFormSchema),
    mode: 'onTouched',
  })

  const values = useWatch({
    control: form.control,
  }) as EditTeamMemberFormValues
  const selectedRole = values.cha_role

  const autoSave = useAutoSave({
    value: values,
    isValid: editTeamMemberFormSchema.safeParse(values).success,
    delay: 0,
    errorMessage: 'Unable to update this team member. Please try again.',
    onSaved: () => router.refresh(),
    save: ({ cha_role, rollo }) =>
      updateWeekendRosterMember({
        rosterId: rosterMember.id,
        updates: {
          cha_role,
          rollo: isNil(rollo) || rollo === '' ? null : rollo,
        },
      }),
  })

  const handleDrop = async () => {
    setIsDropping(true)

    try {
      const result = await updateWeekendRosterMember({
        rosterId: rosterMember.id,
        updates: { status: 'drop' },
      })

      if (isErr(result)) {
        toastError('Unable to drop this team member. Please try again.', {
          error: result.error,
        })
        return
      }

      router.refresh()
      onClose()
    } catch (error) {
      toastError('Unable to drop this team member. Please try again.', {
        error,
      })
    } finally {
      setIsDropping(false)
    }
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3 pr-8">
          <SheetTitle>Edit Team Member</SheetTitle>
          <AutoSaveStatusIndicator
            status={autoSave.status}
            onRetry={autoSave.flush}
            className="ml-auto"
          />
        </div>
        <SheetDescription>
          Edit {rosterMember.users?.first_name} {rosterMember.users?.last_name}
          &apos;s roster information. Changes save as you go.
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-6 p-4"
        >
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
          />
        </form>
      </Form>

      <SheetFooter>
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={handleDrop}
          disabled={isDropping}
          className="w-full"
        >
          {isDropping ? 'Dropping...' : 'Drop Team Member'}
        </Button>
      </SheetFooter>
    </>
  )
}
