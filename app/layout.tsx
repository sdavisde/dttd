import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import Navbar from '@/components/navbar'
import { Footer } from '@/components/footer'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Head from 'next/head'
import { SessionProvider } from '@/components/auth/session-provider'

const notoSerif = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Dusty Trails Tres Dias',
  description: 'Being like-minded, having the same love, being one in spirit and of one mind. Phil 2:2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <Head>
        <meta
          name='apple-mobile-web-app-title'
          content='DTTD'
        />
      </Head>
      <body className={`${notoSerif.className} antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
