import { cn } from '@/lib/utils'

interface GenderToggleProps {
  value: 'male' | 'female' | null
  onChange: (value: 'male' | 'female') => void
}

export function GenderToggle({ value, onChange }: GenderToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('male')}
        className={cn(
          'flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer',
          value === 'male'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-input bg-background text-foreground hover:border-primary/40 hover:bg-accent'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="11" r="4" />
          <path d="M17 3h4v4" />
          <path d="m21 3-5.5 5.5" />
        </svg>
        Male
      </button>
      <button
        type="button"
        onClick={() => onChange('female')}
        className={cn(
          'flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer',
          value === 'female'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-input bg-background text-foreground hover:border-primary/40 hover:bg-accent'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="9" r="4" />
          <path d="M12 13v8" />
          <path d="M9 18h6" />
        </svg>
        Female
      </button>
    </div>
  )
}
