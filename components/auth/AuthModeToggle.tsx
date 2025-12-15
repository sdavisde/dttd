import { Button } from '@/components/ui/button'

interface AuthModeToggleProps {
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
}

export default function AuthModeToggle({
  mode,
  onModeChange,
}: AuthModeToggleProps) {
  return (
    <div className="flex w-full border-b">
      <Button
        type="button"
        variant={mode === 'login' ? 'default' : 'ghost'}
        onClick={() => onModeChange('login')}
        className="flex-1 rounded-b-none"
      >
        Sign In
      </Button>
      <Button
        type="button"
        variant={mode === 'register' ? 'default' : 'ghost'}
        onClick={() => onModeChange('register')}
        className="flex-1 rounded-b-none"
      >
        Create Account
      </Button>
    </div>
  )
}
