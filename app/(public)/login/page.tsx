import { Card } from '@/components/ui/card'
import AuthForm from '@/components/auth/AuthForm'

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        <AuthForm redirectTo={redirectTo} />
      </Card>
    </div>
  )
}
