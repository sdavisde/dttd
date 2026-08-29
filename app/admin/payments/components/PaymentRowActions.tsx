'use client'

import { useState } from 'react'
import { ArrowLeftRight, Ban, MoreHorizontal, Pencil } from 'lucide-react'
import { isNil } from 'lodash'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PaymentTransactionDTO } from '@/services/payment'
import { ReassignPaymentDialog } from './ReassignPaymentDialog'
import { EditPaymentDialog } from './EditPaymentDialog'
import { VoidPaymentDialog } from './VoidPaymentDialog'

type PaymentRowActionsProps = {
  payment: PaymentTransactionDTO
}

type OpenDialog = 'reassign' | 'edit' | 'void' | null

export function PaymentRowActions({ payment }: PaymentRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)

  const isVoided = !isNil(payment.voided_at)
  // Donations have no target, so there is nobody to reassign them to.
  const canReassign = !isNil(payment.target_type)

  const closeDialog = () => setOpenDialog(null)

  if (isVoided) {
    return <span className="text-muted-foreground text-xs">Voided</span>
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Payment actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!canReassign}
            onSelect={() => setOpenDialog('reassign')}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Reassign
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenDialog('edit')}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setOpenDialog('void')}
          >
            <Ban className="mr-2 h-4 w-4" />
            Void
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openDialog === 'reassign' && (
        <ReassignPaymentDialog open onClose={closeDialog} payment={payment} />
      )}
      {openDialog === 'edit' && (
        <EditPaymentDialog open onClose={closeDialog} payment={payment} />
      )}
      {openDialog === 'void' && (
        <VoidPaymentDialog open onClose={closeDialog} payment={payment} />
      )}
    </div>
  )
}
