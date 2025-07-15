'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface WaiverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: string
  onAcknowledge: () => void
  acknowledgeText?: string
  cancelText?: string
  className?: string
}

export function WaiverDialog({
  open,
  onOpenChange,
  title,
  content,
  onAcknowledge,
  acknowledgeText = 'I have read and agree to the terms above',
  cancelText = 'Cancel',
  className,
}: WaiverDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={cn('max-w-2xl max-h-[80vh] flex flex-col', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto'>
          <div className='h-full pr-4 text-sm leading-relaxed'>
            <div className='whitespace-pre-wrap'>{content}</div>
          </div>
        </div>

        <DialogFooter className='flex-col gap-4 sm:flex-row sm:justify-between'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='acknowledge'
              checked={true}
            />
            <Label
              htmlFor='acknowledge'
              className={cn('text-sm')}
            >
              {acknowledgeText}
            </Label>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button onClick={onAcknowledge}>Acknowledge</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
