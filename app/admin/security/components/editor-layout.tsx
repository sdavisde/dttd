'use client'

import { isNil } from 'lodash'
import { Lock, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The three shapes every part of the role editor is built from: a panel (a
 * bordered block, so one part of the editor never runs into the next), a
 * section (a panel with a heading and one muted line) and a setting row (what
 * it is on the left, the control on the right).
 */

type PanelTone = 'default' | 'destructive'

interface EditorPanelProps {
  children: ReactNode
  /** The danger zone reads in destructive red, tinted and outlined. */
  tone?: PanelTone
  className?: string
}

export function EditorPanel({
  children,
  tone = 'default',
  className,
}: EditorPanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-1 rounded-md border p-5 md:p-6',
        tone === 'destructive'
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border bg-card',
        className
      )}
    >
      {children}
    </section>
  )
}

interface EditorSectionProps {
  title: string
  /** One line, muted — why this section exists. */
  description: ReactNode
  children: ReactNode
  tone?: PanelTone
}

export function EditorSection({
  title,
  description,
  children,
  tone = 'default',
}: EditorSectionProps) {
  const destructive = tone === 'destructive'
  return (
    <EditorPanel tone={tone}>
      <h3
        className={cn(
          'flex items-center gap-2 text-base font-semibold',
          destructive ? 'text-destructive' : 'text-foreground'
        )}
      >
        {destructive && (
          <TriangleAlert aria-hidden className="size-4 shrink-0" />
        )}
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div
        className={cn(
          'mt-3 border-t pt-1',
          destructive ? 'border-destructive/25' : 'border-divider'
        )}
      >
        {children}
      </div>
    </EditorPanel>
  )
}

interface SettingRowProps {
  /** The setting's name, plus any pill beside it. */
  title: ReactNode
  description: ReactNode
  /** The switch or segmented control; lives in the fixed right column. */
  control: ReactNode
  /** Quiet lines under the row — a partway hint, a caution, a warning. */
  note?: ReactNode
  /** A full-width panel under the row (the checklist), after the note. */
  children?: ReactNode
  /** Set when the control is a single input, so the whole label toggles it. */
  htmlFor?: string
  /** False for a row that carries its own box instead of the hairline rule. */
  divider?: boolean
  className?: string
}

export function SettingRow({
  title,
  description,
  control,
  note,
  children,
  htmlFor,
  divider = true,
  className,
}: SettingRowProps) {
  const Label = isNil(htmlFor) ? 'div' : 'label'
  return (
    <div
      className={cn(
        'py-3.5',
        divider && 'border-b border-divider last:border-b-0',
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <Label
          htmlFor={htmlFor}
          className={cn(
            'flex min-w-0 flex-col gap-0.5',
            !isNil(htmlFor) && 'cursor-pointer'
          )}
        >
          <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
            {title}
          </span>
          <span className="text-[13px] leading-snug text-muted-foreground">
            {description}
          </span>
        </Label>
        <div className="flex min-h-11 w-full shrink-0 items-center gap-2.5 sm:min-h-0 sm:w-[264px] sm:justify-end sm:pt-0.5">
          {control}
        </div>
      </div>
      {!isNil(note) && (
        <div className="mt-2 flex flex-col gap-1 text-xs leading-snug text-muted-foreground">
          {note}
        </div>
      )}
      {!isNil(children) && <div className="mt-3">{children}</div>}
    </div>
  )
}

/**
 * The small padlock + parent name that sits beside a locked control (or in
 * place of a checkbox), saying where a grant comes from without a sentence.
 */
export function LockedBy({
  parentLabel,
  className,
}: {
  parentLabel: string | null
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-normal whitespace-nowrap text-muted-foreground',
        className
      )}
    >
      <Lock aria-hidden className="size-3 shrink-0" />
      {parentLabel ?? 'Based-on role'}
    </span>
  )
}
