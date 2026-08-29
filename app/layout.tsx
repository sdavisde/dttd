import type { Metadata } from 'next'
import { Fraunces, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import Head from 'next/head'
import { SessionProvider } from '@/components/auth/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toastbox } from '@/components/toastbox'
import { Analytics } from '@vercel/analytics/next'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-fraunces',
})

export const metadata: Metadata = {
  title: 'Dusty Trails Tres Dias',
  description:
    'Being like-minded, having the same love, being one in spirit and of one mind. Phil 2:2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="apple-mobile-web-app-title" content="DTTD" />
      </Head>
      <body
        className={`font-sans antialiased ${sourceSans.variable} ${fraunces.variable}`}
      >
        <QueryProvider>
          <SessionProvider>
            <Analytics />
            {children}
            <Toastbox />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
