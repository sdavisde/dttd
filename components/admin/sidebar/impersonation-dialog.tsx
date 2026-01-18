'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getAllUsers } from '@/services/weekend'
import {
  impersonateUser,
  clearImpersonation,
} from '@/services/identity/impersonation/actions'
import { Results } from '@/lib/results'
import { useRouter } from 'next/navigation'
import { isEmpty, isNil } from 'lodash'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '@/components/auth/session-provider'

type ImpersonationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImpersonationDialog({
  open,
  onOpenChange,
}: ImpersonationDialogProps) {
  const router = useRouter()
  const { user: currentUser, refreshSession } = useSession()
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = Results.toNullable(await getAllUsers())
      return result ?? []
    },
  })
  const [search, setSearch] = useState('')

  const isImpersonating = !isNil(currentUser?.originalUser)

  const filteredUsers = useMemo(() => {
    if (isNil(users)) return []
    if (isEmpty(search.trim())) return users
    const searchLower = search.toLowerCase()
    return users.filter((user) => {
      const fullName =
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.toLowerCase()
      const email = (user.email ?? '').toLowerCase()
      return fullName.includes(searchLower) || email.includes(searchLower)
    })
  }, [users, search])

  const loading = isNil(users)

  const handleSelectUser = async (userId: string) => {
    const result = await impersonateUser({ userId })
    if (Results.isErr(result)) {
      toast.error(result.error)
    }
    onOpenChange(false)
    refreshSession()
    router.refresh()
  }

  const handleClearImpersonation = async () => {
    await clearImpersonation()
    onOpenChange(false)
    refreshSession()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            Select a user to view the site as them.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isImpersonating && (
            <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
              <div className="text-sm">
                <span className="text-muted-foreground">Viewing as </span>
                <span className="font-medium">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearImpersonation}
              >
                Stop Impersonating
              </Button>
            </div>
          )}
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading users...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
