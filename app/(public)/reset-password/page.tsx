import { Card } from '@/components/ui/card'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  
  return (
    <div className="container max-w-sm mx-auto py-8">
      <Card className="shadow-lg">
        <ResetPasswordForm searchParams={params} />
      </Card>
    </div>
  )
}