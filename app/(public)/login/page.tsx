import { Card } from '@/components/ui/card'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        <AuthForm />
      </Card>
    </div>
  )
}
