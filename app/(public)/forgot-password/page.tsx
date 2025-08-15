import { Card } from '@/components/ui/card'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        <ForgotPasswordForm />
      </Card>
    </div>
  )
}