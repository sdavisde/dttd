import { isNil } from 'lodash'
import { Heart, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function SecuelaSignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoggedIn = !isNil(user)

  return (
    <div className="container max-w-sm mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Secuela Sign-Up</CardTitle>
          <CardDescription className="text-base">
            Thank you for your willingness to serve on the upcoming weekend!
            {isLoggedIn
              ? ' Tap the button below to confirm your attendance.'
              : ' Sign in or create an account to confirm your attendance.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoggedIn ? (
            <Button asChild size="lg" className="w-full">
              <a href="/secuela-confirm">
                <ArrowRight className="mr-2 h-4 w-4" />
                Confirm Attendance
              </a>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="w-full">
                <a href="/login?redirectTo=%2Fsecuela-signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href="/join?redirectTo=%2Fsecuela-signin">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
