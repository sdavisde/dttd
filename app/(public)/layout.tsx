import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Dusty Trails Tres Dias',
  description:
    'Being like-minded, having the same love, being one in spirit and of one mind. Phil 2:2',
}

/**
 * The bare frame for pages people reach before (or without) signing in:
 * the landing page, sign-in and join, candidate forms and candidate payment.
 * Signed-in members get the full shell from the (member) route group.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary font-serif text-sm font-semibold text-primary-foreground">
            DT
          </span>
          <span className="grid leading-tight">
            <span className="font-serif text-[15px] font-semibold">
              Dusty Trails
            </span>
            <span className="text-[11.5px] text-muted-foreground">
              Tres Dias
            </span>
          </span>
        </Link>
        <Button variant="outline" size="sm" href="/login">
          Sign in
        </Button>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
