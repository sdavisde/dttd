import { cn } from '@/lib/utils'

/**
 * One line inside a settings card: a label with a quiet subtitle on the left
 * and whatever control the setting needs on the right. Stacks on narrow
 * screens so the control never gets squeezed off the row.
 */
export function SettingRow({
  title,
  subtitle,
  children,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-divider py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-3',
        className
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle !== undefined && (
          <div className="text-[13px] text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {children !== undefined && (
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          {children}
        </div>
      )}
    </div>
  )
}
