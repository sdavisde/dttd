import { Card } from '@/components/ui/card'
import AuthForm from '@/components/auth/AuthForm'

interface JoinPageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { redirectTo } = await searchParams
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        <AuthForm redirectTo={redirectTo} defaultMode="register" />
      </Card>
    </div>
  )
}
