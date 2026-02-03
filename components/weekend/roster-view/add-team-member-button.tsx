'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AddTeamMemberModal } from './add-team-member-modal'
import { Tables } from '@/database.types'

type AddTeamMemberButtonProps = {
  weekendId: string
  weekendTitle: string
  users: Array<Tables<'users'>>
}

export function AddTeamMemberButton({
  weekendId,
  weekendTitle,
  users,
}: AddTeamMemberButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Team Member
      </Button>

      <AddTeamMemberModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        weekendId={weekendId}
        weekendTitle={weekendTitle}
        users={users}
      />
    </>
  )
}
