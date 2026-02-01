import { cn } from '@/lib/utils'

interface CandidateProgressBarProps {
  label: string
  count: number
  capacity: number
}

export function CandidateProgressBar({
  label,
  count,
  capacity,
}: CandidateProgressBarProps) {
  // Calculate percentage, capped at 100% for visual display
  const percentage = Math.min((count / capacity) * 100, 100)
  const isAtOrOverCapacity = count >= capacity

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={cn(
            'text-sm font-semibold',
            isAtOrOverCapacity ? 'text-red-600' : 'text-green-600'
          )}
        >
          {count}/{capacity}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            isAtOrOverCapacity ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
