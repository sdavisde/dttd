import type { Metadata } from 'next'
import { Noto_Serif } from 'next/font/google'
import Navbar from '@/components/navbar'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const notoSerif = Noto_Serif({
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
      <body className={`${notoSerif.className} antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
