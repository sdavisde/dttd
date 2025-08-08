import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Head from 'next/head'
import { SessionProvider } from '@/components/auth/session-provider'
import { Toastbox } from '@/components/toastbox'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
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
      <body className={`font-sans antialiased ${nunito.className}`}>
        <SessionProvider>
          {children}
          <Toastbox />
        </SessionProvider>
      </body>
    </html>
  )
}
