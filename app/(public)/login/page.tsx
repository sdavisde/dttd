import { Card } from '@/components/ui/card'
import AuthForm from '@/components/auth/AuthForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { isNil } from 'lodash'

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, message } = await searchParams
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        {!isNil(message) && (
          <div className="px-6 pt-6">
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        )}
        <AuthForm redirectTo={redirectTo} />
      </Card>
    </div>
  )
}
