'use client'

import * as React from 'react'
import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [hasRead, setHasRead] = React.useState(false)
  const [hasAcknowledged, setHasAcknowledged] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setHasRead(false)
      setHasAcknowledged(false)
    }
  }, [open])

  // Track if user has scrolled to bottom
  const handleScroll = React.useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px tolerance
      setHasRead(isAtBottom)
    }
  }, [])

  const handleAcknowledge = () => {
    if (hasRead && hasAcknowledged) {
      onAcknowledge()
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={cn('max-w-2xl max-h-[80vh] flex flex-col', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Please read the entire document before proceeding</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <div
            ref={contentRef}
            className='h-full overflow-y-auto pr-4 text-sm leading-relaxed'
            onScroll={handleScroll}
          >
            <div className='whitespace-pre-wrap'>{content}</div>
          </div>
        </div>

        <DialogFooter className='flex-col gap-4 sm:flex-row sm:justify-between'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='acknowledge'
              checked={hasAcknowledged}
              onCheckedChange={(checked) => setHasAcknowledged(checked as boolean)}
              disabled={!hasRead}
            />
            <Label
              htmlFor='acknowledge'
              className={cn('text-sm', !hasRead && 'text-muted-foreground')}
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
            <Button
              onClick={handleAcknowledge}
              disabled={!hasRead || !hasAcknowledged}
            >
              Acknowledge
            </Button>
          </div>
        </DialogFooter>

        {!hasRead && (
          <div className='text-xs text-muted-foreground text-center'>
            Please scroll to the bottom to read the entire document
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
